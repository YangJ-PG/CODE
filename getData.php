<?php
/**
 * Created by PhpStorm.
 * User: yangJ
 * Date: 2024/3/11
 * Time: 15:51
 */

use util\RedisTool;
require_once dirname(dirname(__FILE__))."/commonCheckSid.php";
$end_date   =   (isset($_REQUEST['date']) && !empty($_REQUEST['date']) && is_numeric($_REQUEST['date'])) ? $_REQUEST['date'] : '';
$api_name   =   isset($_REQUEST['api_name']) ? $_REQUEST['api_name'] : '';
$interval   =   isset($_REQUEST['interval']) ? (int)$_REQUEST['interval'] : 10;
$bk_code    =   isset($_REQUEST['id']) ? $_REQUEST['id'] : '';

if(empty($end_date)){
    //die(json_encode(array('success' => false, 'code' => '-1', 'reason' => 'date不能为空')));
    $end_date = date('Ymd');
}
if(empty($api_name) || !in_array($api_name,array('mytest','mytest_stocks'))){
    die(json_encode(array('success' => false, 'code' => '-1', 'reason' => 'api_name参数异常')));
}

$terminal       =    null;
$terminal_id    =    null;
if(!empty($sid)){
    $terminal       =   PC;
    $terminal_id    =   $sid;
}elseif(!empty($pid)){
    $terminal       =   MOBILE;
    $terminal_id    =   $pid;
}

$userchild = RedisTool::fechbuysoftbytoken($terminal_id,['ZXZZ'],$terminal);
if(!$userchild['ZXZZ']){
    $data = array('success' => false, 'code' => '-1', 'reason' => '无权限访问!');
    echo json_encode($data);
    die;
}

$return             =   array();
$return['success']  =   true;
if($api_name == 'mytest'){
    $mystockredis   =   \util\RedisTool::getHcyRedis();
    $mystockredis->select(0);
    $last_d         =   $mystockredis->Zrange("SOFT:ZXZZ:PLATE", -1, -1,true);
    $last_d         =   array_values($last_d)[0];
    $end_date       =   $end_date>$last_d?$last_d:$end_date;

    // 获取$interval个交易日
    $redis      =   \util\RedisTool::getOtherRedis($_ENV['HC_REDIS_CONFIG_6381']);
    $redis->SELECT(0);
    $caldays    =   $redis->zRangeByScore("calendar",  date('Ymd',strtotime("$end_date -".($interval+$interval*10)." days")), $end_date);
    $perv_date  =   str_replace('-','', $caldays[count($caldays)-$interval]);
    $redis->close();

    $return['data']['plate']        =   $mystockredis->zRevRangeByScore("SOFT:ZXZZ:PLATE", $end_date, $perv_date, array('withscores' => true));
    if(!empty($return['data']['plate'])){
        $keys                       =   array_map('fun1',array_keys($return['data']['plate']));
        $values                     =   array_map('fun2',array_values($return['data']['plate']));
        $return['data']['plate']    =   array_combine($values,$keys);
        $latest_date                =   (int)substr(max($values),1);

        $inc20Data                  =   $mystockredis->zRevRangeByScore("SOFT:ZXZZ:INC20", $end_date, $perv_date, array('withscores' => true));
        $keys                       =   array_map('fun1',array_keys($inc20Data));
        $values                     =   array_map('fun2',array_values($inc20Data));
        $inc20Data                  =   array_combine($values,$keys);
        foreach($inc20Data as $date =>$vv){
            if(isset($return['data']['plate'][$date])){
                $return['data']['plate'][$date][1] = $vv[0];
            }
        }

        $ZJJCData                  =   $mystockredis->zRevRangeByScore("SOFT:ZXZZ:ZJJC", $end_date, $perv_date, array('withscores' => true));
        $keys                       =   array_map('fun1',array_keys($ZJJCData));
        $values                     =   array_map('fun2',array_values($ZJJCData));
        $ZJJCData                  =   array_combine($values,$keys);
        foreach($ZJJCData as $date =>$vv){
            if(isset($return['data']['plate'][$date])){
                $return['data']['plate'][$date][2] = $vv[0];
            }
        }

        $BINC20Data                 =   $mystockredis->zRevRangeByScore("SOFT:ZXZZ:BINC20", $end_date, $perv_date, array('withscores' => true));
        $keys                       =   array_map('fun1',array_keys($BINC20Data));
        $values                     =   array_map('fun2',array_values($BINC20Data));
        $BINC20Data                 =   array_combine($values,$keys);
        foreach($BINC20Data as $date =>$vv){
            if(isset($return['data']['plate'][$date])){
                $return['data']['plate'][$date][3] = $vv[0];
            }
        }

        $BINCQD20Data               =   $mystockredis->zRevRangeByScore("SOFT:ZXZZ:BINCQD20", $end_date, $perv_date, array('withscores' => true));
        $keys                       =   array_map('fun1',array_keys($BINCQD20Data));
        $values                     =   array_map('fun2',array_values($BINCQD20Data));
        $BINCQD20Data               =   array_combine($values,$keys);
        foreach($BINCQD20Data as $date =>$vv){
            if(isset($return['data']['plate'][$date])){
                $return['data']['plate'][$date][4] = $vv[0];
            }
        }

        $return['data']['stock']    =   $mystockredis->zRevRangeByScore("SOFT:ZXZZ:STOCK", $latest_date, $latest_date, array('withscores' => true));
        if(!empty($return['data']['stock'])){
            $keys                   =   array_map('fun1',array_keys($return['data']['stock']));
            $values                 =   array_map('fun2',array_values($return['data']['stock']));
            $return['data']['stock']=   array_combine($values,$keys);

            $BSTOCKData             =   $mystockredis->zRevRangeByScore("SOFT:ZXZZ:BSTOCK", $latest_date, $latest_date, array('withscores' => true));
            $keys                   =   array_map('fun1',array_keys($BSTOCKData));
            $values                 =   array_map('fun2',array_values($BSTOCKData));
            $BSTOCKData             =   array_combine($values,$keys);
            foreach($BSTOCKData as $date =>$vv){
                if(isset($return['data']['stock'][$date])){
                    $return['data']['stock'][$date][2] = $vv[0];
                }
            }

            $BQDSTOCKData           =   $mystockredis->zRevRangeByScore("SOFT:ZXZZ:BQDSTOCK", $latest_date, $latest_date, array('withscores' => true));
            $keys                   =   array_map('fun1',array_keys($BQDSTOCKData));
            $values                 =   array_map('fun2',array_values($BQDSTOCKData));
            $BQDSTOCKData           =   array_combine($values,$keys);
            foreach($BQDSTOCKData as $date =>$vv){
                if(isset($return['data']['stock'][$date])){
                    $return['data']['stock'][$date][3] = $vv[0];
                }
            }
        }else{
            $return['data']['stock']= [];
        }
    }else{
        $return['data']['plate']    =   $return['data']['stock'] = [];
    }
}else{
    if(empty($bk_code)){
        die(json_encode(array('success' => false, 'code' => '-1', 'reason' => 'id不能为空')));
    }
    $sql = "select 
                right(ss_daily.stk_id,6) stk_id,stock_name,`is_stop` ,
                concat(round(`inc1`*100,1),'%') inc1,
                concat(round(`inc5`*100,1),'%') inc5,
                concat(round(`inc10`*100,1),'%') inc10,
                concat(round(`inc20`*100,1),'%') inc20,
                concat(round(`inc60`*100,1),'%') inc60
            from ss_daily 
            left join ss_stock ss on ss.stk_id = ss_daily.stk_id
            where ss_daily.stk_id in ( select stk_id from ss_bk_map where `code` ='BK".substr($bk_code,2)."' group by stk_id)
            and t_date = '$end_date'";
    $stockModel                 =   new \model\JrjyStockModel();
    $return['data']             =   $stockModel->query52Stock($sql);
    if(!empty($return['data'])){
        foreach($return['data'] as &$val){
            $val->is_stop       =   $val->is_stop == 1?"是":($val->is_stop == -1?"跌停":"否");
            $val                =   implode('##',json_decode(json_encode($val),true));
        }
    }
}
echo json_encode($return);
die;


function fun1($arg){
    return json_decode(substr($arg, 8));
}
function fun2($arg){
    return 'd'.$arg;
}


