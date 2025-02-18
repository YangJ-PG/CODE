<?php
/**
 * 获取K线用于展示在K线上
 * Created by PhpStorm.
 * User: yangJ
 * Date: 2024/3/11
 * Time: 15:26
 */

use util\Tool;

require_once dirname(dirname(dirname(__FILE__)))."/init.php";
$stockid = isset($_REQUEST['stockid']) ? $_REQUEST['stockid'] : '';//股票id
$market = isset($_REQUEST['market']) ? $_REQUEST['market'] : '';//当前市场
$begin_date = isset($_REQUEST['begin_date']) ? $_REQUEST['begin_date'] : '';//传输的类型
$end_date = isset($_REQUEST['end_date']) ? $_REQUEST['end_date'] : '';//传输的类型
$num = isset($_REQUEST['num']) ? $_REQUEST['num'] : ''; //可调用数量
if (empty($stockid) || !preg_match("/^\d{6}$/", $stockid)) {
    $data = array('success' => false, 'code' => '-380001', 'reason' => '参数异常[股票ID必须为6位码]');
    echo json_encode($data);
    die;
}
if (empty($market) || !in_array($market, array('SH', 'SZ','BK'))) {
    $data = array('success' => false, 'code' => '-380001', 'reason' => '参数异常[市场(SH/SZ/BK)异常]');
    echo json_encode($data);
    die;
}
$k_market = "SZSE";
if($market=="SH"){
    $k_market = "SSE";
}

if(!empty($num)){
    $redis = \util\RedisTool::getOtherRedis($_ENV['HC_REDIS_CONFIG_6381']);
    $redis->SELECT(0);
    $days=$redis->zCount('calendar',$end_date,date('Ymd',time()));
    $num=$days+$num;

    if(!empty($begin_date)){
        $days=$redis->zCount('calendar',$begin_date,date('Ymd',time()));
        $num=max($num,$days);
    }
    $http = STOCK_HTTP_URL."kline?symbol=$stockid&ktype=d&market=$k_market&num=$num";
    $output = \util\Tool::curl($http,'GET');
    $file_result = json_decode($output, true);
    $file_result = \util\Tool::arrayToStdClass($file_result);
    $result=array();
    foreach($file_result->data as $item){
        $item = \util\Tool::arrayToStdClass($item);
        $date=substr($item->time,0,8);
        if(strtotime($date)<=strtotime($end_date)){
            $item->time=$date;
            $result[]=$item;
        }
    }
    $data = array('success' => true, 'data' => $result);
    echo json_encode($data);
    die;
}else{
    if(!empty($begin_date)){
        $redis = \util\RedisTool::getOtherRedis($_ENV['HC_REDIS_CONFIG_6381']);
        $redis->SELECT(0);
        $days=$redis->zCount('calendar',$begin_date,date('Ymd',time()));
        $num=$days+1;
    }else{
        $num=1000;
        $begin_date='19910101';
    }
    $http = STOCK_HTTP_URL."kline?symbol=$stockid&ktype=d&market=$k_market&num=$num";
    $output = \util\Tool::curl($http,'GET');
    $file_result = json_decode($output, true);
    $file_result = \util\Tool::arrayToStdClass($file_result);
    if(empty($end_date)){
        $end_date=date('Ymd',time());
    }
    $result=array();
    foreach($file_result->data as $item){
        $item = Tool::arrayToStdClass($item);

        $date=substr($item->time,0,8);
        if(strtotime($date)<=strtotime($end_date) && strtotime($date)>=strtotime($begin_date)){
            $item->time=$date;
            $result[]=$item;
        }
    }
    $data = array('success' => true, 'data' => $result);
    echo json_encode($data);
    die;
}
