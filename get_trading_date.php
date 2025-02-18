<?php
use util\RedisTool;
require_once dirname(dirname(dirname(__FILE__)))."/init.php";

if(!isset($_REQUEST['date'])){
    echo json_encode(array('success'=>false,'reason'=>'切换出错[date为空]!'));
    die();
}

if(!isset($_REQUEST['type'])){
    echo json_encode(array('success'=>false,'reason'=>'切换出错[type为空]!'));
    die();
}
$date           = $_REQUEST['date'];
$type           = $_REQUEST['type'];
if(!strstr($date,'-')){
    $date = substr($date,0,4).'-'.substr($date,4,2).'-'.substr($date,-2);
}

if(!preg_match('/^(19|20)(\d){2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-1])$/', $date)){
    echo json_encode(array('success'=>false,'reason'=>'时间错误!'));
    die();
}

if(date('Y-m-d') == $date && date('H:i')<'16:00'){
    $date     = date('Ymd',strtotime("$date -1 days"));
}

if($type == "add"){
    $e_date     = date('Ymd',strtotime("$date +1 days"));
}elseif($type == "rec"){
    $e_date     = date('Ymd',strtotime("$date -1 days"));
}else{
    $e_date     = $date;
}

$redis          = \util\RedisTool::getOtherRedis($_ENV['HC_REDIS_CONFIG_6381']);
$e_data         = $redis->zRangeByScore('calendar', $e_date, $e_date);

if (isset($e_data) && !empty($e_data) ) {
    $date_end   =   $e_date;
} else {//前一天不是交易日 - 取当日前一个交易日为截止日期
    if($type == "add"){
        $dateArr    =   $redis->zRevRangeByScore('calendar',date('Ymd',strtotime($e_date." +15 days")),date('Ymd',strtotime($e_date)));
        $end_date   =   end($dateArr);
        $date_end   =   $end_date;
    }else{
        $dateArr    =   $redis->zRevRangeByScore('calendar',date('Ymd',strtotime($e_date)),date('Ymd',strtotime($e_date." -15 days")));
        $end_date   =   array_slice($dateArr,0,1);
        $date_end   =   $end_date[0];
    }
}

if(intval($date_end)>=date('Ymd')){
    $date_end       =   date('Ymd');
}

$result             =   new stdClass();
$result->success    =   true;
$result->date =   date('Y-m-d',strtotime("$date_end"));;

$redis->close();
echo json_encode($result,JSON_UNESCAPED_UNICODE);


?>
