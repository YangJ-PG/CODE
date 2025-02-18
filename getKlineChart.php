<?php
/**
 * 获取K线用于展示在K线上
 * Created by PhpStorm.
 * User: yangJ
 * Date: 2024/3/11
 * Time: 15:26
 */

require_once dirname(dirname(dirname(__FILE__)))."/init.php";
$stockid = isset($_REQUEST['stockid']) ? $_REQUEST['stockid'] : '';//股票id
$type = isset($_REQUEST['type']) ? $_REQUEST['type'] : '';//传输的类型
$market = isset($_REQUEST['market']) ? $_REQUEST['market'] : '';//当前市场
$num = isset($_REQUEST['num']) ? $_REQUEST['num'] : 100; //可调用数量
if (empty($stockid) || !preg_match("/^\d{6}$/", $stockid)) {
    $data = array('success' => false, 'code' => '-380001', 'reason' => '参数异常[股票ID必须为6位码]');
    echo json_encode($data);
    die;
}
if (empty($type) || !in_array($type, array('d', '5', '30', '1'))) {
    $data = array('success' => false, 'code' => '-380001', 'reason' => '参数异常[$period异常]');
    echo json_encode($data);
    die;
}
if (empty($market) || !in_array($market, array('SH', 'SZ','BK'))) {
    $data = array('success' => false, 'code' => '-380001', 'reason' => '参数异常[市场(SH/SZ/BK)异常]');
    echo json_encode($data);
    die;
}

$returnArray = array();
$k_market = "SZSE";
if($market=="SH"){
    $k_market = "SSE";
}
if(($stockid=="000001"&&$market=="SH")|| ($stockid=="399001"&&$market=="SZ")||($stockid=="399006"&&$market=="SZ")){
    $http = STOCK_HTTP_URL."kline?symbol=$stockid&ktype=$type&market=$k_market&num=$num";
}else{
    $http = STOCK_HTTP_URL."qfq_kline?symbol=$stockid&ktype=$type&market=$k_market&num=$num";
}
$result = \util\Tool::curl($http,'GET');
$result = json_decode($result, true);
if(empty($result)){
    $data = array('success' => false, 'code' => '-380001', 'reason' => '获取K线异常...');
    echo json_encode($data);
    die;
}
$result = $result['data'];
$returnArray['kline'] = array();
$returnArray['kline_x'] = array();
$tempArre = array();
$index = 0;//下标
$result= \util\Tool::arrayToStdClass($result);
foreach ($result as $item){
    $item = \util\Tool::arrayToStdClass($item);
    if ($index==0)$fristtime = $item->time;
    $tempArr[0] = round($item->open,2);//开盘
    $tempArr[1] = round($item->close,2);//收盘
    $tempArr[2] = round($item->high,2);//最高
    $tempArr[3] = round($item->low,2);//最低
    @$tempArre[$index]->value  = $item->volume*100;
    if($tempArr[1]>$tempArr[0]){
        @$tempArre[$index]->itemStyle->normal->color = "red";
    }else{
        @$tempArre[$index]->itemStyle->normal->color = "green";
    }
    $returnArray['kline'][$index] = ($tempArr);
    if($type=="d"){//如果是日线
        $returnArray['kline_x'][$index] = substr($item->time,0,8);
    }else{
        $returnArray['kline_x'][$index] = $item->time;
    }
    $index++;
}
$returnArray['amount'] = $tempArre;
$data = array('success' => true, 'data' => $returnArray);
echo json_encode($data);
die;
