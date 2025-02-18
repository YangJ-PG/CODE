<?php
require_once dirname(dirname(dirname(__FILE__)))."/init.php";
require_once dirname(dirname(__FILE__))."/style_plate.php";
set_time_limit(0);

//开始日期
if(isset($argv[1]) && !empty($argv[1])){
    $arg_begin  = $argv[1];
}
//结束日期
if(isset($argv[2])&& !empty($argv[2])){
    $arg_end    = $argv[2];
}elseif(isset($arg_begin)){
    $arg_end    = $arg_begin;
}
//不存在：清算板块个股  1:清算板块 2:清算个股
if(isset($argv[3]) && !empty($argv[3])){
    $run_tag  = in_array($argv[3],[1,2,3,4,5,6,7,8])?(int)$argv[3]:'';
}

echo date("Y-m-d H:i:s")."---begin syncRemoteData---\n<br>";
try{
    if(!isset($arg_begin)){
        $v_date_s       =   (date('H:i') < '15:55')?date('Ymd',strtotime('-1 day')):date('Ymd');
        $v_date_e       =   $v_date_s;
    }else{
        $v_date_s       =   $arg_begin;
        $v_date_e       =   $arg_end;
        if($v_date_e == date('Ymd') && date('H:i') < '15:55'){
            $v_date_e   =   date('Ymd',strtotime('-1 day'));
        }
    }
    $redis              =   \util\RedisTool::getOtherRedis($_ENV['HC_REDIS_CONFIG_6381']);
    $redis->SELECT(0);
    $interval_caldays   =   $redis->zRangeByScore("calendar",  20220101,99999999);
    $caldays            =   $redis->zRangeByScore("calendar", $v_date_s, $v_date_e);
    $redis->close();
    if(!empty($caldays)){
        $style_bk_code_arr          =   explode(',',str_replace('\'','',$style_bk_code));
        $mystockredis               =   \util\RedisTool::getHcyRedis();
        $mystockredis->select(0);
        $stockModel                 =   new \model\JrjyStockModel();
        foreach($caldays as $v_date){
            $_v_date                =   $v_date;
            $v_date                 =   str_replace('-','', $v_date);
            $bk_gl_arr              =   [];
            
            // 板块数据
            if(!isset($run_tag) || $run_tag == 1){
                $request_data           =   getPlate($_v_date);
                if($request_data['success'] && !empty($request_data['data'])){
                    $result[$v_date]    =   array();
                    $code_arr           =   array();
                    # 前4个 - 热点板块分析表16
                    if(!empty($request_data['data']['table16'])){
                        foreach($request_data['data']['table16'] as $key=>$val){
                            if($key < 4){
                                $result[$v_date][$val['stk_id']]['stk_id']           =   $val['stk_id'];
                                $result[$v_date][$val['stk_id']]['stk_name']         =   $val['stk_name'];
                                $result[$v_date][$val['stk_id']]['type']             =   '16-4';
                                array_push($code_arr, "'BK".substr($val['stk_id'],2)."'");
                            }
                        }
                    }
                    #10个 - 当日涨幅前10 （向上去重)
                    $sql = "select case when `type` = 1 then concat('82',right(b.`code`,4)) else concat('80',right(b.`code`,4)) end code,
                        b.name,round(avg(b.inc1),3) av_inc
                        from  
                        (
                        select code,name,type,stk_id,
                        (select inc1 from ss_daily d where d.stk_id=bk.stk_id and t_date='$_v_date') inc1
                        from ss_bk_map bk
                        where type in (1,2) 
                        and code not in ($style_bk_code)
                        and stk_id < 2800000
                        ) b
                        group by b.code,b.name
                        order by av_inc desc limit 20";
                    $data        =   $stockModel->query52Stock($sql);
                    if(!empty($data)){
                        $count = 0;
                        foreach($data as $data13_val){
                            if($data13_val->av_inc){
                                if(!isset($result[$v_date][$data13_val->code])){
                                    if($count>=10)
                                        break;
                                    $result[$v_date][$data13_val->code]['stk_id']            =   $data13_val->code;
                                    $result[$v_date][$data13_val->code]['stk_name']          =   $data13_val->name;
                                    $result[$v_date][$data13_val->code]['type']              =   '1-10';
                                    array_push($code_arr, "'BK".substr($data13_val->code,2)."'");
                                    $count++;
                                }
                            }
                        }
                    }
                    # 3个 - 10日涨幅前3(向上去重)
                    if(!empty($request_data['data']['table11'])){
                        $count = 0;
                        foreach($request_data['data']['table11'] as $key=>$val){
                            if(!isset($result[$v_date][$val['stk_id']])){
                                if($count>=3)
                                    break;
                                $result[$v_date][$val['stk_id']]['stk_id']           =   $val['stk_id'];
                                $result[$v_date][$val['stk_id']]['stk_name']         =   $val['stk_name'];
                                $result[$v_date][$val['stk_id']]['type']             =   '10-3';
                                array_push($code_arr, "'BK".substr($val['stk_id'],2)."'");
                                $count++;
                            }
                        }
                    }
                    # 3个 - 20日涨幅前3（向上去重)
                    if(!empty($request_data['data']['table12'])){
                        $count = 0;
                        foreach($request_data['data']['table12'] as $key=>$val){
                            if(!isset($result[$v_date][$val['stk_id']])){
                                if($count>=3)
                                    break;
                                $result[$v_date][$val['stk_id']]['stk_id']          =   $val['stk_id'];
                                $result[$v_date][$val['stk_id']]['stk_name']        =   $val['stk_name'];
                                $result[$v_date][$val['stk_id']]['type']            =   '20-3';
                                array_push($code_arr, "'BK".substr($val['stk_id'],2)."'");
                                $count++;
                            }
                        }
                    }
                    // 市值 + 涨幅
                    if(!empty($result[$v_date])){
                        $sql = "select case when `type` = 1 then concat('82',right(b.`code`,4)) else concat('80',right(b.`code`,4)) end code,
                            round(sum(b.total_inc1),3) total_inc,
                            round(avg(b.inc1)*100,1) av_inc1,
                            round(avg(b.inc5)*100,1) av_inc5,
                            round(avg(b.inc10)*100,1) av_inc10,
                            round(avg(b.inc20)*100,1) av_inc20,
                            round(avg(b.inc60)*100,1) av_inc60,
                            round(avg(b.inc120)*100,1) av_inc120,
                            round(avg(b.total_a_inc1)*100,1) av_total_inc1,
                            round(avg(b.total_a_inc5)*100,1) av_total_inc5,
                            round(avg(b.total_a_inc10)*100,1) av_total_inc10,
                            round(avg(b.total_a_inc20)*100,1) av_total_inc20,
                            round(avg(b.total_a_inc60)*100,1) av_total_inc60,
                            round(avg(b.total_a_inc120)*100,1) av_total_inc120
                            from  
                            (
                            select code,`type`,
                            (select total_a_val*inc1 from ss_daily d where d.stk_id=bk.stk_id and t_date='$_v_date') total_inc1,
                            (select inc1 from ss_daily d1 where d1.stk_id=bk.stk_id and t_date='$_v_date') inc1,
                            (select inc5 from ss_daily d5 where d5.stk_id=bk.stk_id and t_date='$_v_date') inc5,
                            (select inc10 from ss_daily d10 where d10.stk_id=bk.stk_id and t_date='$_v_date') inc10,
                            (select inc20 from ss_daily d20 where d20.stk_id=bk.stk_id and t_date='$_v_date') inc20,
                            (select inc60 from ss_daily d60 where d60.stk_id=bk.stk_id and t_date='$_v_date') inc60,
                            (select inc120 from ss_daily d120 where d120.stk_id=bk.stk_id and t_date='$_v_date') inc120,
                            (select total_a_val*inc1/(1+inc1) from ss_daily dd1 where dd1.stk_id=bk.stk_id and t_date='$_v_date') total_a_inc1,
                            (select total_a_val*inc5/(1+inc5) from ss_daily dd5 where dd5.stk_id=bk.stk_id and t_date='$_v_date') total_a_inc5,
                            (select total_a_val*inc10/(1+inc10) from ss_daily dd10 where dd10.stk_id=bk.stk_id and t_date='$_v_date') total_a_inc10,
                            (select total_a_val*inc20/(1+inc20) from ss_daily dd20 where dd20.stk_id=bk.stk_id and t_date='$_v_date') total_a_inc20,
                            (select total_a_val*inc60/(1+inc60) from ss_daily dd60 where dd60.stk_id=bk.stk_id and t_date='$_v_date') total_a_inc60,
                            (select total_a_val*inc120/(1+inc120) from ss_daily dd120 where dd120.stk_id=bk.stk_id and t_date='$_v_date') total_a_inc120
                            from ss_bk_map bk
                            where `type` in (1,2) 
                            and code in (".implode(',',$code_arr).")
                            and stk_id < 2800000
                            ) b
                            group by b.code";
                        $data                   =   $stockModel->query52Stock($sql);
                        foreach($data as $val){
                            $code               =   $val->code;
                            if(!isset($bk_gl_arr[$code])){
                                $bk_gl_arr[$code]   =   getGl($code, $_v_date, $style_bk_code_arr);
                            }
                            $result[$v_date][$code]['market_value'] =   $val->total_inc;
                            $result[$v_date][$code]['gl_bk']        =   !empty($bk_gl_arr[$code])?$bk_gl_arr[$code]:'';
                            $result[$v_date][$code]['av_inc']       =   $val->av_inc1.",".$val->av_inc5.",".
                                                                        $val->av_inc10.",".$val->av_inc20.",".
                                                                        $val->av_inc60.",".$val->av_inc120;
                            $result[$v_date][$code]['av_total_inc'] =   $val->av_total_inc1.",".$val->av_total_inc5.",".
                                                                        $val->av_total_inc10.",".$val->av_total_inc20.",".
                                                                        $val->av_total_inc60.",".$val->av_total_inc120;
                        }

                        $resultnew[$v_date][0] = array();
                        foreach($result[$v_date] as $key=>$val){
                            array_push($resultnew[$v_date][0], implode('##', $val));
                        }
                        unset($result, $data, $request_data);

                        if($mystockredis->zCount('SOFT:ZXZZ:PLATE', $v_date, $v_date)){
                            $mystockredis->zRemRangeByScore('SOFT:ZXZZ:PLATE', $v_date, $v_date);
                        }
                        $mystockredis->zAdd('SOFT:ZXZZ:PLATE',$v_date,$v_date.json_encode($resultnew[$v_date]));
                        echo  date("Y-m-d H:i:s")."--- $v_date PLATE ok ---\n<br>";
                    }else{
                        echo  date("Y-m-d H:i:s")."--- $v_date no PLATE data ---\n<br>";
                    }
                }
            }
            
            //个股数据
            if(!isset($run_tag) || $run_tag == 2){
                $result         =   array();
                foreach([0,1] as $table_index){
                    if(!isset($result[$v_date][$table_index]))
                        $result[$v_date][$table_index] = array();

                    $stockids        =   '';
                    if($table_index == 1){
                        //涨幅表4
                        $request_data           =   getPlate($_v_date);
                        if($request_data['success'] && !empty($request_data['data'])){
                            # 热点板块分析表4
                            if(!empty($request_data['data']['table4'])){
                                foreach($request_data['data']['table4'] as $val){
                                    $val['stk_id']      =   substr(strval(1000000+$val['stk_id']),1);
                                    $prefix             =   '2';
                                    if($val['stk_id']>600000 && $val['stk_id']<700000){
                                        $prefix         =   '1';
                                    }
                                    $val['stk_id']      =   $prefix.$val['stk_id'];

                                    $stockids .= "'".$val['stk_id']."',";
                                }
                            }
                            $stockids = !empty($stockids)?substr($stockids,0,-1):'';
                        }
                        if(empty($stockids)){
                            continue;
                        }
                    }
                    foreach(['inc1','inc5','inc10','inc20','inc60','inc120'] as $fliter){
                        $sql = "select  
                                right(stock.stk_id,6) stock_id,
                                stock.stock_name ,
                                GROUP_CONCAT(`name`) `name`,
                                concat(round(`".$fliter."`*100,1),'%') inc,
                                concat(round(`inc1`*100,1),'%') cur_inc
                            from 
                                ss_daily daily, ss_bk_map map,ss_stock stock
                            where 
                                daily.stk_id = stock.stk_id and daily.stk_id = map.stk_id 
                                and map.code not in ($style_bk_code)
                                ".(!empty($stockids)?" and daily.stk_id in ($stockids) ":'')."
                                and `type` in(1,2) and t_date='$v_date' 
                            group by 
                                daily.stk_id 
                            ORDER BY ".$fliter." desc
                            limit 50";
                        $data           =   $stockModel->query52Stock($sql);
                        $inc_str        =   '';
                        foreach($data as $val){
                            if(strlen($inc_str))
                                $inc_str .= '|';
                            $inc_str    .= $val->stock_id.'##'.$val->stock_name.'##'.$val->name.'##'.$val->inc.'##'.$val->cur_inc;
                        }
                        array_push($result[$v_date][$table_index], $inc_str);
                    }
                }
                if(!empty($result[$v_date][0]) && !empty($result[$v_date][1])){
                    unset($data);
                    if($mystockredis->zCount('SOFT:ZXZZ:STOCK', $v_date, $v_date)){
                        $mystockredis->zRemRangeByScore('SOFT:ZXZZ:STOCK', $v_date, $v_date);
                    }
                    $mystockredis->zAdd('SOFT:ZXZZ:STOCK',$v_date,$v_date.json_encode($result[$v_date]));
                    echo  date("Y-m-d H:i:s")."--- $v_date STOCK ok ---\n<br>";
                }else{
                    echo  date("Y-m-d H:i:s")."--- $v_date no STOCK data ---\n<br>";
                }
            }

            //全市场 - 板块涨幅
            if(!isset($run_tag) || $run_tag == 3){
                $result = array();
                foreach(['inc1','inc5','inc10','inc20','inc60','inc120'] as $fliter){
                    $sql = "select case when `type` = 1 then concat('82',right(b.`code`,4)) else concat('80',right(b.`code`,4)) end code
                            ,b.name,round(sum(b.total_inc1),3) total_inc,round(avg(b.".$fliter.")*100,1) av_inc
                            from  
                            (
                            select code,name,type,stk_id,
                            (select total_a_val*inc1 from ss_daily d where d.stk_id=bk.stk_id and t_date='$_v_date') total_inc1,
                            (select ".$fliter." from ss_daily d1 where d1.stk_id=bk.stk_id and t_date='$_v_date') ".$fliter."
                            from ss_bk_map bk
                            where type in (1,2) 
                            and code not in ($style_bk_code)
                            and stk_id < 2800000
                            ) b
                            group by b.code,b.name
                            order by av_inc desc limit 20";
                    $data           =   $stockModel->query52Stock($sql);
                    $inc_str        =   '';
                    foreach($data as $val){
                        $code       =   $val->code;
                        if(!isset($bk_gl_arr[$code])){
                            $bk_gl_arr[$code]    =   getGl($code, $_v_date, $style_bk_code_arr);
                        }

                        if(strlen($inc_str))
                            $inc_str .= '|';
                        if(!empty($bk_gl_arr[$code])){
                            $inc_str    .= $code.'##'.$val->name.'##'.$val->av_inc.'##'.$val->total_inc.'##'.$bk_gl_arr[$code];
                        }else{
                            $inc_str    .= $code.'##'.$val->name.'##'.$val->av_inc.'##'.$val->total_inc;
                        }
                    }
                    if(!isset($result[$v_date][0]))
                        $result[$v_date][0] = array();
                    array_push($result[$v_date][0], $inc_str);
                }
                if(!empty($result[$v_date][0])){
                    unset($data);
                    if($mystockredis->zCount('SOFT:ZXZZ:INC20', $v_date, $v_date)){
                        $mystockredis->zRemRangeByScore('SOFT:ZXZZ:INC20', $v_date, $v_date);
                    }
                    $mystockredis->zAdd('SOFT:ZXZZ:INC20',$v_date,$v_date.json_encode($result[$v_date]));
                    echo  date("Y-m-d H:i:s")."--- $v_date INC20 ok ---\n<br>";
                }else{
                    echo  date("Y-m-d H:i:s")."--- $v_date no INC20 data ---\n<br>";
                }
            }

            //全市场 - 资金进出
            if(!isset($run_tag) || $run_tag == 4){
                $result =   array();
                foreach([1=>'inc1',5=>'inc5',10=>'inc10',20=>'inc20',60=>'inc60',120=>'inc120'] as $interval=>$incday){
                    $e_date         =   $_v_date;
                    $b_date         =   $interval_caldays[(int)array_search($_v_date,array_values($interval_caldays))-$interval+1];
                    $sql            =   "select 
                                            b.code bkcode,
                                            case when `type` = 1 then concat('82',right(b.`code`,4)) else concat('80',right(b.`code`,4)) end code,
                                            sum(case when increase=0 then 0 else amo*sign(increase) end) as total_increase
                                        from 
                                            ss_bk_map b,ss_vol v 
                                        WHERE 
                                            v.stk_id = b.stk_id and b.`type` in (1,2)
                                            and code not in ($style_bk_code)
                                            and (v_date>='$b_date' and v_date<='$e_date')
                                        GROUP BY b.code
                                        order by total_increase desc limit 20";
                    $data     =   $stockModel->query52Stock($sql);
                    $bkcodes  =   '';
                    foreach($data as $val){
                        if(strlen($bkcodes))
                            $bkcodes .= ',';
                        $bkcodes .=   "'".$val->bkcode."'";
                    }
                    $sql = "select b.`name`,case when `type` = 1 then concat('82',right(b.`code`,4)) else concat('80',right(b.`code`,4)) end code,
                            round(sum(b.total_inc1),3) total_inc,
                            round(avg(b.ava_inc)*100,1) av_inc
                            from  
                            (
                            select `code`,`type`,`name`,
                            (select total_a_val*inc1 from ss_daily d where d.stk_id=bk.stk_id and t_date='$_v_date') total_inc1,
                            (select ".$incday." from ss_daily d1 where d1.stk_id=bk.stk_id and t_date='$_v_date') ava_inc
                            from ss_bk_map bk
                            where `type` in (1,2) 
                            and code in ($bkcodes)
                            and stk_id < 2800000
                            ) b
                            group by b.code";
                    $incdata    =   $stockModel->query52Stock($sql);
                    $inc_arr    =   [];
                    foreach($incdata as $val){
                        $inc_arr[$val->code]    =  $val->code.'##'.$val->name.'##'.$val->av_inc.'##'.$val->total_inc;
                    }
                    unset($incdata);
                    $increase_str        =   '';
                    foreach($data as $val){
                        $code       =   $val->code;
                        if(!isset($bk_gl_arr[$code])){
                            $bk_gl_arr[$code]    =   getGl($code, $_v_date, $style_bk_code_arr);
                        }

                        if(strlen($increase_str))
                            $increase_str .=    '|';
                        $increase_str    .=     $inc_arr[$code].'##';
                        if(!empty($bk_gl_arr[$code])){
                            $increase_str    .=     $bk_gl_arr[$code];
                        }
                        $increase_str        .=     '##'.$val->total_increase;
                    }
                    if(!isset($result[$v_date][0]))
                        $result[$v_date][0] = array();
                    array_push($result[$v_date][0], $increase_str);
                }
                if(!empty($result[$v_date][0])){
                    unset($data,$inc_arr);
                    if($mystockredis->zCount('SOFT:ZXZZ:ZJJC', $v_date, $v_date)){
                        $mystockredis->zRemRangeByScore('SOFT:ZXZZ:ZJJC', $v_date, $v_date);
                    }
                    $mystockredis->zAdd('SOFT:ZXZZ:ZJJC',$v_date,$v_date.json_encode($result[$v_date]));
                    echo  date("Y-m-d H:i:s")."--- $v_date ZJJC ok ---\n<br>";
                }else{
                    echo  date("Y-m-d H:i:s")."--- $v_date no ZJJC data ---\n<br>";
                }
            }

            //笔区间涨幅 - 板块数据
            if(!isset($run_tag) || $run_tag == 5){
                $result = array();
                foreach(['inc1_low','inc5_low','inc15_low','inc25_low'] as $fliter){
                    $sql = "select case when `type` = 1 then concat('82',right(b.`code`,4)) else concat('80',right(b.`code`,4)) end code
                            ,b.name,round(sum(b.total_inc1),3) total_inc,round(avg(b.".$fliter.")*100,1) av_inc
                            from  
                            (
                            select code,name,type,stk_id,
                            (select total_a_val*inc1 from ss_daily d where d.stk_id=bk.stk_id and t_date='$_v_date') total_inc1,
                            (select ".$fliter." from ss_binc d1 where d1.stk_id=bk.stk_id and t_date='$_v_date') ".$fliter."
                            from ss_bk_map bk
                            where type in (1,2) 
                            and code not in ($style_bk_code)
                            and stk_id < 2800000
                            ) b
                            group by b.code,b.name
                            order by av_inc desc limit 20";
                    $data           =   $stockModel->query52Stock($sql);
                    $inc_str        =   '';
                    foreach($data as $val){
                        $code       =   $val->code;
                        if(!isset($bk_gl_arr[$code])){
                            $bk_gl_arr[$code]    =   getGl($code, $_v_date, $style_bk_code_arr);
                        }

                        if(strlen($inc_str))
                            $inc_str .= '|';
                        if(!empty($bk_gl_arr[$code])){
                            $inc_str    .= $code.'##'.$val->name.'##'.$val->av_inc.'##'.$val->total_inc.'##'.$bk_gl_arr[$code];
                        }else{
                            $inc_str    .= $code.'##'.$val->name.'##'.$val->av_inc.'##'.$val->total_inc;
                        }
                    }
                    if(!isset($result[$v_date][0]))
                        $result[$v_date][0] = array();
                    array_push($result[$v_date][0], $inc_str);
                }
                if(!empty($result[$v_date][0])){
                    unset($data);
                    if($mystockredis->zCount('SOFT:ZXZZ:BINC20', $v_date, $v_date)){
                        $mystockredis->zRemRangeByScore('SOFT:ZXZZ:BINC20', $v_date, $v_date);
                    }
                    $mystockredis->zAdd('SOFT:ZXZZ:BINC20',$v_date,$v_date.json_encode($result[$v_date]));
                    echo  date("Y-m-d H:i:s")."--- $v_date BINC20 ok ---\n<br>";
                }else{
                    echo  date("Y-m-d H:i:s")."--- $v_date no BINC20 data ---\n<br>";
                }
            }

            //笔区间涨幅 - 个股数据
            if(!isset($run_tag) || $run_tag == 6){
                $result         =   array();
                foreach(['inc1_low','inc5_low','inc15_low','inc25_low'] as $fliter){
                    $sql = "select  
                            right(stock.stk_id,6) stock_id,
                            stock.stock_name ,
                            GROUP_CONCAT(`name`) `name`,
                            concat(round(`".$fliter."`*100,1),'%') inc,
                            concat(round(`inc1`*100,1),'%') cur_inc
                        from 
                            ss_daily daily, ss_binc binc, ss_bk_map map,ss_stock stock
                        where 
                            daily.stk_id = stock.stk_id and daily.stk_id = map.stk_id 
                            and daily.stk_id = binc.stk_id and binc.t_date = daily.t_date 
                            and map.code not in ($style_bk_code)
                            and `type` in(1,2) and binc.t_date='$v_date' 
                        group by 
                            daily.stk_id 
                        ORDER BY ".$fliter." desc
                        limit 50";
                    $data           =   $stockModel->query52Stock($sql);
                    $inc_str        =   '';
                    foreach($data as $val){
                        if(strlen($inc_str))
                            $inc_str .= '|';
                        $inc_str    .= $val->stock_id.'##'.$val->stock_name.'##'.$val->name.'##'.$val->inc.'##'.$val->cur_inc;
                    }
                    if(!isset($result[$v_date][0]))
                        $result[$v_date][0] = array();
                    array_push($result[$v_date][0], $inc_str);
                }

                if(!empty($result[$v_date][0])){
                    unset($data);
                    if($mystockredis->zCount('SOFT:ZXZZ:BSTOCK', $v_date, $v_date)){
                        $mystockredis->zRemRangeByScore('SOFT:ZXZZ:BSTOCK', $v_date, $v_date);
                    }
                    $mystockredis->zAdd('SOFT:ZXZZ:BSTOCK',$v_date,$v_date.json_encode($result[$v_date]));
                    echo  date("Y-m-d H:i:s")."--- $v_date BSTOCK ok ---\n<br>";
                }else{
                    echo  date("Y-m-d H:i:s")."--- $v_date no BSTOCK data ---\n<br>";
                }
            }

            //笔涨幅强度 - 板块数据
            if(!isset($run_tag) || $run_tag == 7){
                $result = array();
                foreach([   'inc1'=>'(inc1_low - inc1_high)',
                            'inc5'=>'(inc5_low - inc5_high)',
                            'inc15'=>'(inc15_low - inc15_high)',
                            'inc25'=>'(inc25_low - inc25_high)'] as $fliter=>$formula){
                    $sql = "select case when `type` = 1 then concat('82',right(b.`code`,4)) else concat('80',right(b.`code`,4)) end code
                            ,b.name,round(sum(b.total_inc1),3) total_inc,round(avg(b.".$fliter.")*100,1) av_inc
                            from  
                            (
                            select code,name,type,stk_id,
                            (select total_a_val*inc1 from ss_daily d where d.stk_id=bk.stk_id and t_date='$_v_date') total_inc1,
                            (select ".$formula." from ss_binc d1 where d1.stk_id=bk.stk_id and t_date='$_v_date') ".$fliter."
                            from ss_bk_map bk
                            where type in (1,2) 
                            and code not in ($style_bk_code)
                            and stk_id < 2800000
                            ) b
                            group by b.code,b.name
                            order by av_inc desc limit 20";
                    $data           =   $stockModel->query52Stock($sql);
                    $inc_str        =   '';
                    foreach($data as $val){
                        $code       =   $val->code;
                        if(!isset($bk_gl_arr[$code])){
                            $bk_gl_arr[$code]    =   getGl($code, $_v_date, $style_bk_code_arr);
                        }

                        if(strlen($inc_str))
                            $inc_str .= '|';
                        if(!empty($bk_gl_arr[$code])){
                            $inc_str    .= $code.'##'.$val->name.'##'.$val->av_inc.'##'.$val->total_inc.'##'.$bk_gl_arr[$code];
                        }else{
                            $inc_str    .= $code.'##'.$val->name.'##'.$val->av_inc.'##'.$val->total_inc;
                        }
                    }
                    if(!isset($result[$v_date][0]))
                        $result[$v_date][0] = array();
                    array_push($result[$v_date][0], $inc_str);
                }
                if(!empty($result[$v_date][0])){
                    unset($data);
                    if($mystockredis->zCount('SOFT:ZXZZ:BINCQD20', $v_date, $v_date)){
                        $mystockredis->zRemRangeByScore('SOFT:ZXZZ:BINCQD20', $v_date, $v_date);
                    }
                    $mystockredis->zAdd('SOFT:ZXZZ:BINCQD20',$v_date,$v_date.json_encode($result[$v_date]));
                    echo  date("Y-m-d H:i:s")."--- $v_date BINCQD20 ok ---\n<br>";
                }else{
                    echo  date("Y-m-d H:i:s")."--- $v_date no BINCQD20 data ---\n<br>";
                }
            }

            //笔涨幅强度 - 个股数据
            if(!isset($run_tag) || $run_tag == 8){
                $result         =   array();
                foreach([   'inc1'=>'(inc1_low - inc1_high)',
                            'inc5'=>'(inc5_low - inc5_high)',
                            'inc15'=>'(inc15_low - inc15_high)',
                            'inc25'=>'(inc25_low - inc25_high)'] as $fliter=>$formula){
                    $sql = "select  
                            right(stock.stk_id,6) stock_id,
                            stock.stock_name ,
                            GROUP_CONCAT(`name`) `name`,
                            concat(round(".$formula."*100,1),'%') inc,
                            concat(round(`inc1`*100,1),'%') cur_inc
                        from 
                            ss_daily daily, ss_binc binc, ss_bk_map map,ss_stock stock
                        where 
                            daily.stk_id = stock.stk_id and daily.stk_id = map.stk_id 
                            and daily.stk_id = binc.stk_id and binc.t_date = daily.t_date 
                            and map.code not in ($style_bk_code)
                            and `type` in(1,2) and binc.t_date='$v_date' 
                        group by 
                            daily.stk_id 
                        ORDER BY ".$formula." desc
                        limit 50";
                    $data           =   $stockModel->query52Stock($sql);
                    $inc_str        =   '';
                    foreach($data as $val){
                        if(strlen($inc_str))
                            $inc_str .= '|';
                        $inc_str    .= $val->stock_id.'##'.$val->stock_name.'##'.$val->name.'##'.$val->inc.'##'.$val->cur_inc;
                    }
                    if(!isset($result[$v_date][0]))
                        $result[$v_date][0] = array();
                    array_push($result[$v_date][0], $inc_str);
                }

                if(!empty($result[$v_date][0])){
                    unset($data);
                    if($mystockredis->zCount('SOFT:ZXZZ:BQDSTOCK', $v_date, $v_date)){
                        $mystockredis->zRemRangeByScore('SOFT:ZXZZ:BQDSTOCK', $v_date, $v_date);
                    }
                    $mystockredis->zAdd('SOFT:ZXZZ:BQDSTOCK',$v_date,$v_date.json_encode($result[$v_date]));
                    echo  date("Y-m-d H:i:s")."--- $v_date BQDSTOCK ok ---\n<br>";
                }else{
                    echo  date("Y-m-d H:i:s")."--- $v_date no BQDSTOCK data ---\n<br>";
                }
            }
        }
    }else{
        echo  date("Y-m-d H:i:s")."--- calendar is empty ---\n<br>";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
echo date("Y-m-d H:i:s")."---end syncRemoteData---\n<br>";

//主线板块
function getPlate($_v_date){
    $data           =   request_url('zhfx/plate_analysis.php',
        array('v_date' => $_v_date)
    );
    $data           =   json_decode($data,true);
    if(
        !$data['success'] ||
        empty($data['data']) ||
        empty($data['table4']) ||
        empty($data['table11']) ||
        empty($data['table12']) ||
        empty($data['table16'])
    ){
        for($i = 0; $i<3; $i++){
            $data           =   request_url('zhfx/plate_analysis.php',
                array('v_date' => $_v_date)
            );
            $data           =   json_decode($data,true);
            if(
                $data['success'] &&
                !empty($data['data']) &&
                !empty($data['table4']) &&
                !empty($data['table11']) &&
                !empty($data['table12']) &&
                !empty($data['table16'])
            ){
                return $data;
            }
        }
    }
    return $data;
}

//关联板块
function getGl($code, $_v_date, $style_bk_code_arr){
    $data          =   analyseGl($code, $_v_date, $style_bk_code_arr);
    if(empty($data)){
        for($i = 0; $i<3; $i++){
            $data  =   analyseGl($code, $_v_date, $style_bk_code_arr);
            if(!empty($data)){
                return $data;
            }
        }
    }
    return $data;
}

//关联板块数据请求
function analyseGl($code, $_v_date, $style_bk_code_arr){
    $gl_stocks      =   array();
    # 数量关联前三
    $request_data = request_url('glfx/plate_analysis.php',
        array(
            'code'              =>  $code,
            'sSorts'            =>  'repeat_rate,desc',
            'v_date'            =>  $_v_date,
            'iDisplayStart'     =>  0,
            'iDisplayLength'    =>  100)
    );
    $request_data   =   json_decode($request_data,true);
    if($request_data['success'] && !empty($request_data['data']['aaData'])){
        foreach($request_data['data']['aaData'] as $request_val){
            if(count($gl_stocks)>=3)
                break;
            $code_child =   $request_val['code_child'];
            # 去除风格类板块
            if(in_array('BK'.substr($code_child,2),$style_bk_code_arr))
                continue;
            # 去除细分行业
            if(substr($code_child,0,1) == 'X')
                continue;
            # 去重
            if(isset($gl_stocks[$code_child]))
                continue;
            if($request_val['repeat_num']>1){
                $gl_stocks[$code_child] = $request_val['name_child']."(".round($request_val['repeat_rate']*100,1).")".$code_child;
            }
        }
    }
    # 涨关联前三
    $request_data = request_url('glfx/plate_analysis.php',
        array(
            'code'              =>  $code,
            'sSorts'            =>  'inc_repeat_rate,desc',
            'v_date'            =>  $_v_date,
            'iDisplayStart'     =>  0,
            'iDisplayLength'    =>  100)
    );
    $request_data   =   json_decode($request_data,true);
    if($request_data['success'] && !empty($request_data['data']['aaData'])){
        foreach($request_data['data']['aaData'] as $request_val){
            if(count($gl_stocks)>=6)
                break;
            $code_child =   $request_val['code_child'];
            # 去除风格类板块
            if(in_array('BK'.substr($code_child,2),$style_bk_code_arr))
                continue;
            # 去除细分行业
            if(substr($code_child,0,1) == 'X')
                continue;
            # 去重
            if(isset($gl_stocks[$code_child]))
                continue;
            if($request_val['inc_repeat_num']>1){
                if(!in_array($code_child,$gl_stocks)){
                    $gl_stocks[$code_child] = $request_val['name_child']."(".round($request_val['repeat_rate']*100,1).")".$code_child;
                }
            }
        }
    }
    if(!empty($gl_stocks)){
        return implode(',', $gl_stocks);
    }else{
        return '';
    }
}

function request_url($action_url,$data){
    $domain_url =   'http://127.0.0.1/webphp/hchan/';
    $ch         =   curl_init();
    curl_setopt($ch, CURLOPT_URL, $domain_url.$action_url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_COOKIE, "mobile=18355169166");
    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        $tmpInfo = curl_error($ch);
        curl_close($ch);
        die(json_encode(array('success' => false, 'code'=>100000, 'reason' => $tmpInfo)));
    }
    curl_close($ch);
    return $result;
}
