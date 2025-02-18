(function($){
    $.me = {
        "hState": null,
        "playtimer": {},
        "traceBkTop20": {},
        "traceBkTop20_old": {},
        "traceBgColorTop20": [
            "#e0620d",
            "#7d6619",
            "#808080",
            "#F08080",
            "#2ac845",
            "#3cb371",
            "#1aaba8",
            "#4169e1",
            "#594d9c",
            "#82529d",
            "#db639b",
            "#e16531",
            "#ff3030",
            "#83c6c2",
            "#bdb76b",
            "#a686ba",
            "#e89abe",
            "#f6ef37",
            "#afcd50",
            "#f3ca7e",
        ],
        //rgb渐变色 - 由深到浅
        "traceBgColorTop20_rgb": [
            [[241,125,125],[241,125,125]],
            [[250,200,88],[250,200,88]],
            [[145,204,117],[145,204,117]],
            [[115,192,222],[115,192,222]],
            [[234,124,204],[234,124,204]],
            [[254,197,175],[254,197,175]],
            [[254,228,52],[254,236,110]],//黄
            [[59,162,114],[59,162,114]],
            [[11,212,215],[137,248,249]],//青
            [[154,96,180],[154,96,180]],
            [[254,118,18],[254,167,102]],//橙
            [[1,255,12],[129,255,135]],//绿
            [[84,112,198],[84,112,198]],
            [[254,6,30],[254,122,134]],//红
            [[0,152,104],[125,255,214]],//土蓝
            [[68,90,120],[136,158,188]],//褐
            [[255,1,234],[255,111,243]],//紫
            [[37,37,255],[163,163,255]],//蓝
            [[37,134,53],[102,212,120]],//浅绿
            [[127,130,27],[127,130,27]],
        ],
        "sid":null,
        "kline_array": null,
        "up_array_old": [],
        "up_array": [],
        "up_stock_array_old": [],
        "up_stock_array": [],
        "last_play_idx":null,
        "max_date":null,
        "down_array": [],
        "curPlate": null,
        "curDate": null,
        "curAnalyseDate": null,
        "brushparams": null,
        "curDir": null,
        "plateType": 'gn',
        "myChart": null,
        "myChartMin": null,
        "dateRange": [],
        "brushScope": [],
        "brushScopeDate": [],
        "brushNum": '',
        "zoomScope": [70, 100],
        "option": {
            title: {
                show: true,
                textStyle: {
                    color: '#ebe9e8'
                    //	color: '#8392A5'
                },
                text: '主线追踪'
            },
            grid: [
                {x: '5%', y: '10%', width: '93%', height: '70%'}
            ],
            dataZoom: [
                {
                    type: 'inside'
                },
                {
                    type: 'slider',
                    realtime: false,
                    borderColor: '#434343',
                    textStyle: {
                        color: '#8392A5'
                    }
                }
            ],
            tooltip: {
                alwaysShowContent : true,
                /*showContent : true,
                show: true,*/
                trigger: 'axis',
                triggerOn:'click',
                axisPointer: {
                    type: 'line'
                },
                position: function (point, params, dom) {
                    // 固定在顶部
                    if (point[0] < 200) {
                        return [point[0] + 30, 30]
                    } else {
                        return [64, 30];
                    }
                },
                textStyle: {
                    color: '#8392A5'
                },
                transitionDuration: 0,
                formatter: function (params) {
                    if (!params[0]) return;
                    var res = ((params[0].name.indexOf(':') == -1) ? params[0].name : (params[0].name.substring(0, 4) + ' ' + params[0].name.substring(4, 16).replace('/', '-'))) + '</br>' + params[0].seriesName;
                    res += '</br>  开盘 : ' + params[0].value[1] + '</br>  收盘 : ' + params[0].value[2];
                    res += '<br/>  最高 : ' + params[0].value[3] + '</br>  最低 : ' + params[0].value[4];
                    if ($("#average-line input[type='checkbox']").is(':checked')) {
                        res += '<br/>' + params[1].seriesName + ' : ' + params[1].value;
                        res += '<br/>' + params[2].seriesName + ' : ' + params[2].value;
                        res += '<br/>' + params[3].seriesName + ' : ' + params[3].value;
                        res += '<br/>' + params[4].seriesName + ' : ' + params[4].value;
                    }
                    $.me.curDate = params[0].name;
                    $.me.curAnalyseDate = params[0].name;
                    $.me.last_play_idx = parseInt(params[0].dataIndex);
                    var cur_date = params[0].name.substr(0,4)+'-'+params[0].name.substr(4,2)+'-'+params[0].name.substr(-2);
                    if($(".trace-date").html() != cur_date){
                        $(".trace-date").html(cur_date);
                        $.me.reloadData();
                    }
                    $.me.updateKDrawLine();
                    return res
                }
            },
            toolbox: {
                show: false,
            },
            brush: {
                throttleType: 'debounce',
                throttleDelay: 500,
                xAxisIndex: 'all',
                brushLink: 'all',
                //brushStyle:{
                //	color: 'rgba(165,140,180,0.3)',
                //	borderColor: 'rgba(120,140,180,0.8)'
                //},
                outOfBrush: {
                    colorAlpha: 1
                }
            },
            legend: {
                show: true,
                padding: 20
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,
                data: null,
                axisLabel: {
                    color: '#ebe9e8'
                },
                axisLine: {
                    lineStyle: {
                        //		color: '#8392A5'
                        color: '#434343'
                    }
                },
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                /*scale: true,
                 boundaryGap: [0.001, 0.001],
                 splitNumber: 4,
                 axisLine: {
                 lineStyle: {
                 color: '#8392A5'
                 }
                 },
                 splitLine: {
                 show: true
                 }*/
                scale: true,
                splitNumber: 4,
                /*minInterval:100,*/
                interval: 100,
                min: function (value) {
                    return Math.round(value.min / 50) * 50 - 50;
                },
                max: function (value) {
                    return Math.round(value.max / 50) * 50 + 50;
                },
                axisLabel: {
                    color: '#ebe9e8'
                },
                axisLine: {
                    lineStyle: {color: '#434343'}
                },
                splitLine: {
                    show: true,
                    lineStyle: {color: '#434343'}
                },
                axisTick: {show: false}
            },
            series: {
                name: 'K线',
                /*silent: true,*/
                type: 'candlestick',
                z: 10001,
                data: null,
                markPoint: {
                    label: {
                        normal: {show: false}
                    },
                    symbol: 'triangle',
                    symbolSize: [10, 10],
                    data: []
                },
                itemStyle: {
                    normal: {
                        color: 'red',
                        color0: '#157E15',
                        borderColor: 'red',
                        borderColor0: '#157E15'
                    }
                },
                animation: false
            }
        },
        "GetUrlParam": function (name) {
            var url = location.search; //获取url中"?"符后的字串
            var theRequest = {};
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
                }
            }
            if (name) {
                return theRequest[name];
            }
            return theRequest;
        },
        "init": function () {
            var params = $.me.GetUrlParam();
            if (params['hState']) {
                $.me.hState = params['hState'];
            }
            if (params['sid']) {
                $.me.sid = params['sid'];
            }
            if(params['bgColor']){
                if(params['bgColor'] == 'W'){
                    $.me.option.title.textStyle.color = '#1A2535';
                    $.me.option.xAxis.axisLabel.color = '#1A2535';
                    $.me.option.yAxis.axisLabel.color = '#1A2535';
                    $.me.option.dataZoom[1].textStyle.color = '#1A2535';
                    $.me.option.tooltip.textStyle.color = '#1A2535';
                    var fileUrl     =   'css/stk-plate-tracing_white.css?ver=1.00.00.05';
                    var fileref     =   document.createElement("link");
                    fileref.setAttribute("rel","stylesheet");
                    fileref.setAttribute("type","text/css");
                    fileref.setAttribute("href",fileUrl);
                    document.getElementsByTagName("head")[0].appendChild(fileref);
                }else if(params['bgColor'] == 'B'){
                    $.me.option.title.textStyle.color = '#ebe9e8';
                    $.me.option.xAxis.axisLabel.color = '#ebe9e8';
                    $.me.option.yAxis.axisLabel.color = '#ebe9e8';
                    $.me.option.dataZoom[1].textStyle.color = '#8392A5';
                    $.me.option.tooltip.textStyle.color = '#8392A5';
                    var filename    =   'stk-plate-tracing_white.css';
                    var allsuspects =   document.getElementsByTagName('link');
                    for (var i = allsuspects.length; i >= 0; i--){
                        if (allsuspects[i] && allsuspects[i].getAttribute('href') != null &&
                            allsuspects[i].getAttribute('href').indexOf(filename) != -1)
                        {
                            allsuspects[i].parentNode.removeChild(allsuspects[i]);
                        }
                    }
                }
            }

            $.me.addEvent();
            $.me.drawChart();
            $.me.init_date_picker();
            $.me.initDatePicker();
            $.me.clickEvent();
            $.me.reloadData();
        },
        "reloadData":function(){
            $.me.getData();
            $.me.fillSortData();
            $.me.fillTable();
            $.me.initDateRange();
            $.me.show_num_tip();
        },
        "updateKDrawLine":function(){
            $('#k-draw-line').hide();
            var start_index     =   $.me.myChart.getModel().option.dataZoom[0].startValue;
            var end_index       =   $.me.myChart.getModel().option.dataZoom[0].endValue;
            var _k_start_date   =   $.me.option.xAxis.data[start_index];
            var _k_end_date     =   $.me.option.xAxis.data[end_index];
            if( $.me.curDate &&
                parseInt($.me.curDate) >= parseInt(_k_start_date) &&
                parseInt($.me.curDate) <= parseInt(_k_end_date)
            ){
                var xAxis       =   $.me.myChart.getModel().getComponent('xAxis').axis; // 获取 x 轴对象
                var left_per    =   $.me.myChart.getOption().grid[0].left;//y轴距离echart最左边的距离
                var height_per  =   $.me.myChart.getOption().grid[0].height;//y轴高度
                var add_barX    =   parseFloat(left_per)*parseFloat($('#k-draw').css('width'))*0.01;
                var barX        =   xAxis.dataToCoord($.me.curDate); // 获取柱的横坐标
                var _left       =   (add_barX+barX)+'px';
                var _height     =   (parseFloat($('.draw').css('height'))*parseFloat(height_per)*0.01)+'px';
                $('#k-draw-line').css({'left':_left,'height':_height});
                //console.log('Bar Center:', [barX]);
                $('#k-draw-line').show();
            }
        },
        "cellHeight":function(show_num){
            var marginTop = "5px";
            var sort_body_height = "200px";
            if(show_num == 20){
                sort_body_height = "534px";
            }else if(show_num == 10 || show_num == 15){
                sort_body_height = "400px";
            }
            var div_height = (parseFloat(sort_body_height)-(show_num+1)*parseFloat(marginTop))/show_num+"px";
            var gl_height = (parseFloat(div_height)-2)+"px";
            return [sort_body_height, div_height, gl_height, marginTop];
        },
        "clickEvent":function(){
            //加入自选股
            $('.centerdiv').on('click', function(e) {
                document.getElementById("right-menu").style.display = "none";
            });

            document.onclick = function () {
                document.getElementById("right-menu").style.display = "none";
            };

            $('#stocks-table').on('contextmenu', 'tbody tr', function () {
                //获取股票代码
                var data_id = $(this).attr("data-id");
                var prefix='SZ';
                if(data_id.substr(0,1)=='6')
                    prefix='SH';
                if (data_id && data_id.length > 0) {
                    $("#right-menu ul b").text(data_id + "加入：");
                    var forRight = document.getElementById("right-menu");
                    $.ajax({
                        type: "post",
                        dataType: "json",
                        url: "/webphp/hchan/get_soft_jurisdiction_count.php",
                        data:{'sid':$.me.sid,'type': 'SY_ZXG'},
                        success: function (result) {
                            if(result.success){
                                var count = (result.data>5)?5:result.data;
                                var htmls = "";
                                for(var i = 0;i<count;i++){
                                    htmls += "<a href='javascript:void(0);' sort=\""+(i+1)+"\" onclick=\"$.me.setMyStock(this);\">设为自选股"+(i+1)+"</a>";
                                }
                                $("#right-menu div").eq(0).html(htmls);
                            }
                        }
                    });
                    var event = event || window.event;
                    //显示菜单
                    forRight.style.display = "block";
                    //菜单定位
                    forRight.style.left = event.pageX + "px";
                    forRight.style.top = (event.pageY-10) + "px";
                    $("#right-menu").attr("stockid", data_id + prefix);
                }
                //return false为了屏蔽默认事件
                return false;
            });

            //监控键盘左右键 - 控制K线
            document.addEventListener('keydown', function(event) {
                if(event.keyCode !== 37 && event.keyCode !== 39){
                    return;
                }
                var dataZoom    =   $.me.myChart.getOption().dataZoom[0]; // 假设数据缩放组件的索引为 0
                var startValue  =   dataZoom.startValue;
                var endValue    =   dataZoom.endValue;
                // 获取 x 轴对应的 option.xAxis.data 数组
                var xAxisData   =   $.me.myChart.getOption().series[0].data.map(item => item[0]); // 假设第一个系列是 K 线图
                // 查找起始和结束值在 xAxisData 中对应的键值
                var startPoint  =   xAxisData.findIndex(item => item === startValue);
                var endPoint    =   xAxisData.findIndex(item => item === endValue);
                // 获取起始和结束的键值
                var startKey    =   parseInt(xAxisData[startPoint]);
                var endKey      =   parseInt(xAxisData[endPoint]);
                if (event.keyCode === 37) {//左箭头
                    if($.me.last_play_idx != null){
                        $.me.last_play_idx--;
                    }else{
                        $.me.last_play_idx = endKey;
                    }
                } else if (event.keyCode === 39) {//右箭头
                    if($.me.last_play_idx != null){
                        $.me.last_play_idx++;
                    }else{
                        $.me.last_play_idx = startKey;
                    }
                }
                if (event.keyCode === 37) {//左箭头
                    if($.me.last_play_idx != null){
                        if($.me.last_play_idx < startKey){
                            $.me.last_play_idx = endKey;
                        }
                    }else{
                        $.me.last_play_idx = endKey;
                    }
                }else{//右箭头
                    if($.me.last_play_idx != null){
                        if($.me.last_play_idx > endKey){
                            $.me.last_play_idx = startKey;
                        }
                    }else{
                        $.me.last_play_idx = startKey;
                    }
                }
                $.me.myChart.dispatchAction({
                    type: 'hideTip',
                });
                $.me.myChart.dispatchAction({
                    type:'downplay',
                    seriesIndex:0,
                    dataIndex:$.me.last_play_idx
                });
                $.me.myChart.dispatchAction({
                    type:'highlight',
                    seriesIndex:0,
                    dataIndex:$.me.last_play_idx
                })
                $.me.myChart.dispatchAction({
                    type: 'showTip',
                    seriesIndex: 0,
                    dataIndex: $.me.last_play_idx
                });
            });

            $(document).ready(function() {
                var delay   = 200; //延迟时间
                var clicks  = 0,clicks_up = 0;
                var timer   = null,timer_up = null;

                $('.sort-body.sort-bk-body').on('click','.sort-cell.bk-cell', function(e) {
                    clicks++; // 每次点击增加计数
                    if (clicks === 1) {
                        var $this = $(this);
                        timer = setTimeout(function() {
                            // 在延迟时间后执行单击事件逻辑
                            var bid = $this.attr("bid").substr(2);
                            var dateArray = [];
                            $(".sort-table div.sort-cell.focus").removeClass('focus');
                            $(".sort-table.up div[bid=su" + bid + "]").addClass("focus");
                            $(".cal-body div.focus").removeClass('focus');
                            $.me.curPlate = [bid, $this.find('span.bk-name').attr('bk-name')];
                            var dd = 0, //最大日期
                                dt, //循环体中的临时日期
                                plates,
                                plateinfo;

                            for (var i in $.me.inputData) {
                                dt = i.replace('d', '');
                                plates = $.me.inputData[i][0];
                                for (var j = 0; j < plates.length; j++) {
                                    plateinfo = plates[j].split("##");
                                    if (plateinfo[0] == bid) {
                                        dateArray.push('u' + dt);
                                        $('#' + i + " div.up>div[bid=u" + bid + "]").addClass("focus");
                                        if (dt > dd)
                                            dd = dt;
                                    }
                                }
                            }
                            if(dd != 0 && dd != undefined){
                                $.me.curDate = dd;
                                $.me.setScrollPos(dd);
                            }else{
                                $.me.curDate = $('.cal-body td:eq(0)').html();
                                $(".cal-body tr.cur").removeClass("cur");
                            }
                            $.me.showDetails();
                            
                            clicks = 0; // 重置计数器
                        }, delay);
                    } else {
                        clearTimeout(timer); // 如果在延迟时间内发生第二次点击，则取消延迟执行的单击事件

                        var allstockids = '';
                        var allData = $('.sort-body.sort-bk-body .sort-cell.bk-cell');
                        for (var i = 0; i < allData.length; i++) {
                            var temp = $(allData[i]).attr("bid").replace('su','');
                            allstockids += (allstockids == '') ? temp : ',' + temp;
                        }
                        var stockid = $(this).attr("bid").replace('su','');
                        var prefix = 'SZ';
                        if (stockid.substr(0, 1) == '1')
                            prefix = 'SH';

                        if (window.location.href.indexOf('#&bkid=') > -1) {
                            var parr = window.location.href.split('#&bkid=');
                        } else {
                            var parr = window.location.href.split('#&echan=');
                        }
                        var url = parr[0] + "#&echan=" + stockid + prefix + "&allstockids=" + allstockids;
                        window.location.href = url;

                        clicks = 0; // 重置计数器
                    }
                });

                $(".cal-body").delegate("td>div>div", "click", function () {
                    clicks_up++; // 每次点击增加计数
                    var $this = $(this);
                    if (clicks_up === 1) {
                        timer_up = setTimeout(function() {
                            // 在延迟时间后执行单击事件逻辑
                            var bid, kid, dir, dt, dirname, platename;
                            bid = $this.attr("bid").substr(1);
                            $.me.curPlate = [bid, $this.find('span:eq(0)').text()];
                            $.me.curDate = $this.closest("tr").attr("id").substr(1);

                            $(".cal-body div.focus").removeClass('focus');
                            $('.sort-table .focus').removeClass('focus');
                            $(".sort-table.up div[bid=su" + bid + "]").addClass("focus");

                            var dateArray = [], plateinfo, plates;

                            for (var i in $.me.inputData) {
                                plates = $.me.inputData[i][0];
                                for (var j = 0; j < plates.length; j++) {
                                    plateinfo = plates[j].split("##");
                                    if (plateinfo[0] == bid) {
                                        dateArray.push(i.replace('d', 'u'));
                                        $('#' + i + " div.up>div[bid=u" + bid + "]").addClass("focus");
                                    }
                                }
                            }
                            $.me.showDetails();

                            clicks_up = 0; // 重置计数器
                        }, delay);
                    }else{
                        clearTimeout(timer_up); // 如果在延迟时间内发生第二次点击，则取消延迟执行的单击事件

                        var allstockids = '';
                        var allData = $this.parents('div.up').find('div');
                        for (var i = 0; i < allData.length; i++) {
                            var temp = $(allData[i]).attr("bid").replace('u','');
                            allstockids += (allstockids == '') ? temp : ',' + temp;
                        }
                        var stockid = $(this).attr("bid").replace('u','');
                        var prefix = 'SZ';
                        if (stockid.substr(0, 1) == '1')
                            prefix = 'SH';

                        if (window.location.href.indexOf('#&bkid=') > -1) {
                            var parr = window.location.href.split('#&bkid=');
                        } else {
                            var parr = window.location.href.split('#&echan=');
                        }
                        var url = parr[0] + "#&echan=" + stockid + prefix + "&allstockids=" + allstockids;
                        window.location.href = url;

                        clicks_up = 0; // 重置计数器
                    }
                });
            });

            $(".sort-body.sort-stock-body").on("dblclick",'.sort-cell',function(e){
                e.preventDefault();
                var stockid = $(this).attr("bid").replace('su','');
                var prefix='SZ';
                if(stockid.substr(0,1)=='6')
                    prefix='SH';

                var allstockids = '';
                var allData= $('.sort-body.sort-stock-body .sort-cell');
                for (var i =0;i< allData.length;i++){
                    var temp =$(allData[i]).attr("bid").replace('su','');
                    allstockids+= (allstockids=='')?temp:','+temp;
                }
                var parr = window.location.href.split('#&echan=');
                parr = parr[0].split('#&bkid=');
                var url =parr[0]+ "#&echan=" +stockid+ prefix+"&allstockids="+allstockids;

                window.location.href = url;
            });

            $("#analyse").on("click",function () {
                $.me.curDate = null;
                $.me.curPlate = null;
                if ($("#stocks").hasClass("ui-dialog-content")) {
                    $("#stocks").dialog("close");
                }
                $.me.reloadData();
            });
            
            $(".bk-sort-type").on("change",function () {
                if(parseInt($(this).val())>=3){
                    $('.bk-zf-num-container').show();
                    /*$('.bk-zf-num option[value=2]').attr('selected',true);*/
                    var select_day = parseInt($('.bk-zf-num option:selected').html());
                    if(parseInt($(this).val()) >= '7'){
                        $('.bk-zf-num').html('<option value="0" '+((select_day == '1')?'selected':'')+'>1</option>\n' +
                            '                        <option value="1" '+((select_day == '5')?'selected':'')+'>5</option>\n' +
                            '                        <option value="2">15</option>\n' +
                            '                        <option value="3">25</option>');
                    }else{
                        $('.bk-zf-num').html('<option value="0" '+((select_day == '1')?'selected':'')+'>1</option>\n' +
                            '                        <option value="1" '+((select_day == '5')?'selected':'')+'>5</option>\n' +
                            '                        <option value="2" '+((select_day == '10')?'selected':'')+'>10</option>\n' +
                            '                        <option value="3" '+((select_day == '20')?'selected':'')+'>20</option>\n' +
                            '                        <option value="4" '+((select_day == '60')?'selected':'')+'>60</option>\n' +
                            '                        <option value="5" '+((select_day == '120')?'selected':'')+'>120</option>');

                    }
                    if(select_day != parseInt($('#statistics-date').val())){
                        $('#statistics-date').val(select_day);
                        $("#analyse").trigger('click');
                    }else{
                        $.me.fillSortData();
                    }
                }else{
                    $('.bk-zf-num-container').hide();
                    $.me.fillSortData();
                }
                $('.cal-body div>div').removeClass('focus');
                $.me.show_num_tip();
            });

            $(".bk-zf-num").on("change",function () {
                var select_day = parseInt($('.bk-zf-num option:selected').html());
                if(select_day != parseInt($('#statistics-date').val())){
                    $('#statistics-date').val(select_day);
                    $("#analyse").trigger('click');
                }else{
                    $.me.fillSortData();
                }
                $('.cal-body div>div').removeClass('focus');
                $.me.show_num_tip();
            });
            
            $(".stock-zf-num,.group-type").on("change",function () {
                $.me.fillSortData();
                $.me.show_num_tip();
            });

            $(".stock-sort-type").on("change",function () {
                var select_day = parseInt($('.stock-zf-num option:selected').html());
                if(parseInt($(this).val()) >= '3'){
                    $('.stock-zf-num ').html('<option value="0" '+((select_day == '1')?'selected':'')+'>1</option>\n' +
                        '                        <option value="1" '+((select_day == '5')?'selected':'')+'>5</option>\n' +
                        '                        <option value="2">15</option>\n' +
                        '                        <option value="3">25</option>');
                }else{
                    $('.stock-zf-num ').html('<option value="0" '+((select_day == '1')?'selected':'')+'>1</option>\n' +
                        '                        <option value="1" '+((select_day == '5')?'selected':'')+'>5</option>\n' +
                        '                        <option value="2" '+((select_day == '10')?'selected':'')+'>10</option>\n' +
                        '                        <option value="3" '+((select_day == '20')?'selected':'')+'>20</option>\n' +
                        '                        <option value="4" '+((select_day == '60')?'selected':'')+'>60</option>\n' +
                        '                        <option value="5" '+((select_day == '120')?'selected':'')+'>120</option>');

                }
                $.me.fillSortData();
                $.me.show_num_tip();
            });

            $(".select-container div").on("click",function () {
                if($(this).hasClass('selected')){
                    $(this).removeClass('selected');
                    if(!$('.select-bk').hasClass('selected') && !$('.select-stock').hasClass('selected')){
                        $(this).addClass('selected');
                    }
                }else{
                    $(this).addClass('selected');
                }
                var bk = false, stock = false;
                if($('.select-bk').hasClass('selected')){
                    bk = true;
                }
                if($('.select-stock').hasClass('selected')){
                    stock = true;
                }
                if(bk && stock){
                    $('.bk-container').show();
                    $('.stock-container').show();
                    $('.sort-body').css('width','562px');
                    if(parseFloat($('.sort-bk-body .sort-cell[index=0]').css('width'))>500){
                        var bk_dom = $('.sort-bk-body .sort-cell');
                        for(var i = 0; i<bk_dom.length ; i++){
                            bk_dom.eq(i).css('width',(parseFloat(bk_dom.eq(i).css('width'))-562)+'px');
                        }
                    }
                    if(parseFloat($('.sort-stock-body .sort-cell[index=0]').css('width'))>500){
                        var stock_dom = $('.sort-stock-body .sort-cell');
                        for(var i = 0; i<stock_dom.length ; i++){
                            stock_dom.eq(i).css('width',(parseFloat(stock_dom.eq(i).css('width'))-562)+'px');
                        }
                    }
                    $('.sort-bk-body,.sort-stock-body').show();
                    $('.show-tag').hide();
                    $('.show-3').show();
                }else{
                    if(bk){
                        $('bk-container').show();
                        $('.stock-container').hide();
                        $('.sort-bk-body').css('width','1124px');
                        if(parseFloat($('.sort-bk-body .sort-cell[index=0]').css('width'))<1000){
                            var bk_dom = $('.sort-bk-body .sort-cell');
                            for(var i = 0; i<bk_dom.length ; i++){
                                bk_dom.eq(i).css('width',(parseFloat(bk_dom.eq(i).css('width'))+562)+'px');
                            }
                        }
                        $('.sort-stock-body').hide();
                        $('.show-tag').hide();
                        $('.show-1').show();
                    }else{
                        $('.bk-container').hide();
                        $('.stock-container').show();
                        $('.sort-stock-body').css('width','1124px');
                        if(parseFloat($('.sort-stock-body .sort-cell[index=0]').css('width'))<1000){
                            var stock_dom = $('.sort-stock-body .sort-cell');
                            for(var i = 0; i<stock_dom.length ; i++){
                                stock_dom.eq(i).css('width',(parseFloat(stock_dom.eq(i).css('width'))+562)+'px');
                            }
                        }
                        $('.sort-bk-body').hide();
                        $('.show-tag').hide();
                        $('.show-2').show();
                    }
                }
                $.me.show_num_tip();
            });

            $(".show-num").on("change",function(){
                var show_num            =   parseInt($(this).val());
                var heights             =   $.me.cellHeight(show_num);
                var sort_body_height    =   heights[0];
                var div_height          =   heights[1];
                var gl_height           =   heights[2];
                var marginTop           =   heights[3];
                $('.sort-body').css('height',sort_body_height);
                var dom = $(".sort-table.up .sort-cell");
                dom.find('.gl-list').css({'height':gl_height, 'line-height':gl_height});
                dom.css({'height':div_height,'line-height':div_height});
                for(var i=0;i<dom.length;i++){
                    var move_px_ava     =   parseFloat(div_height)+parseFloat(marginTop);
                    var index           =   parseInt(dom.eq(i).attr('index'));
                    var move_px         =   index*move_px_ava;
                    dom.eq(i).css({'top':move_px+'px'});
                }
            });

            $("#k-begin-date,#k-end-date").on("change",function(){
                var state = false;
                if($(this).attr("id") == "k-begin-date"){
                    state = true;
                }
                // 当前时间范围
                var start_index = $.me.myChart.getModel().option.dataZoom[0].startValue;
                var end_index = $.me.myChart.getModel().option.dataZoom[0].endValue;
                var _k_start_date = $.me.option.xAxis.data[start_index];
                var _k_end_date = $.me.option.xAxis.data[end_index];

                var this_date = $(this).val();
                var day_interval_state = false;
                if($(this).attr("id") == "k-begin-date" && $("#k-end-date").val().length>0){
                    var date1 = new Date(this_date);
                    var date2 = new Date($("#k-end-date").val());
                    day_interval_state = true;
                }else if($(this).attr("id") == "k-end-date" && $("#k-begin-date").val().length>0){
                    var date1 = new Date($("#k-begin-date").val());
                    var date2 = new Date(this_date);
                    day_interval_state = true;
                }
                if(day_interval_state){
                    var date3=date2.getTime()-date1.getTime();
                    var days=Math.floor(date3/(24*3600*1000));
                    if(days > 92){
                        if($(this).attr("id") == "k-begin-date"){
                            var d= new Date($("#k-end-date").val());
                            d.setDate(d.getDate() - 92);
                            var this_date=d.getFullYear()+
                                "-"+
                                ((d.getMonth()+1)>=10?d.getMonth()+1:"0"+(d.getMonth()+1))+
                                "-"+
                                ((d.getDate())>=10?d.getDate():"0"+(d.getDate()));
                        }else{
                            var d= new Date($("#k-begin-date").val());
                            d.setDate(d.getDate() + 92);
                            var this_date=d.getFullYear()+
                                "-"+
                                ((d.getMonth()+1)>=10?d.getMonth()+1:"0"+(d.getMonth()+1))+
                                "-"+
                                ((d.getDate())>=10?d.getDate():"0"+(d.getDate()));
                        }
                    }
                }

                $.ajax({
                    type: "post",
                    async: false,
                    dataType: "json",
                    url: "/webphp/hchan/zxzz/get_trading_date.php",
                    data: {'date': this_date, 'type': "now"},
                    success: function (result) {
                        if (result.success) {
                            var cur_date = result.date.replace(/-/g,'');
                            if(cur_date <= _k_start_date){
                                cur_date = _k_start_date;
                            }else if(cur_date >= _k_end_date){
                                cur_date = _k_end_date;
                            }
                            var cur_date = cur_date.substr(0,4)+'-'+cur_date.substr(4,2)+'-'+cur_date.substr(-2);
                            if(state){
                                $("#k-begin-date").val(cur_date);
                            }else{
                                $("#k-end-date").val(cur_date);
                            }
                            $.me.myChart.dispatchAction({
                                type: 'brush',
                                areas: [
                                    {
                                        brushType: 'lineX',
                                        coordRange: [$("#k-begin-date").val().replace(/-/g,''), $("#k-end-date").val().replace(/-/g,'')],
                                        xAxisIndex: 0
                                    }
                                ]
                            });
                        } else {
                            $.me.showMsgAlert(result.reason);
                        }
                    }
                });
            });

            $(".trace-run").click(function () {
                if($.me.brushparams == null || $.me.brushparams.batch[0].selected[0].dataIndex.length == 0){
                    $.me.showMsgAlert("请重新选择追踪区间");
                    return;
                }
                if ($(this).hasClass("play")) {
                    if($.me.playtimer){
                        for(var i in $.me.playtimer){
                            clearTimeout($.me.playtimer[i]);
                        }
                    }
                    $(this).removeClass("play").addClass("stop");
                    $("#k-draw").css({"cursor": "allowed", 'pointer-events': "auto"});
                    $(".select-main").css({'pointer-events': "auto"});
                    $(".play-input-disabled").removeAttr('disabled').removeClass('input-disabled');
                }else{
                    var play_rate_sec       =   parseInt($('.play-rate').val());
                    $(this).removeClass("stop").addClass("play");
                    $("#k-draw").css({"cursor": "not-allowed", 'pointer-events': "none"});
                    $(".select-main").css({'pointer-events': "none"});
                    $.me.playRangeAnalyse(play_rate_sec*2+800);
                    $(".play-input-disabled").attr('disabled',true).addClass('input-disabled');
                }
            });

            $("#statistics-date").unbind("input").bind('input', function (e) {
                var reg            =   new RegExp("^[0-9]+$");
                var statistics_date          =    $.trim($(this).val());
                if(
                    (statistics_date.length == 0 || parseInt(statistics_date) == 0) ||
                    !reg.test(statistics_date) ||
                    (parseInt($(this).val()) < 1 || parseInt($(this).val()) > 250)
                ) {
                    $(this).val(10);
                }
            });

            $("#statistics-date,#k-begin-date,#k-end-date").focus(function () {
                window.location.href = "#&echan=ffffff";
            }).blur(function(){
                window.location.href = "#&echan=llllll";
            });
        },
        "show_num_tip":function(dom_class){
            var tip_word = '',tip_word2 = '';
            var bk_sort_type    =   $('.bk-sort-type option:selected').val();
            if(bk_sort_type == '1'){
                tip_word = '主线板块(进榜次数/当日市值增)';
            }else if(bk_sort_type == '2'){
                tip_word = '主线板块(多日多榜/进榜次数/当日市值增)';
            }else{
                var bk_zf_num    =   $('.bk-zf-num option:selected').html();
                if(bk_sort_type == '3'){
                    tip_word = '主线板块('+bk_zf_num+'日涨幅/进榜次数/当日市值增)';
                }else if(bk_sort_type == '4'){
                    tip_word = '主线板块('+bk_zf_num+'日涨幅/进榜次数/当日市值增)';
                }else if(bk_sort_type == '5'){
                    tip_word = '主线板块('+bk_zf_num+'日市值增/'+bk_zf_num+'日涨幅/进榜次数/当日市值增)';
                }else if(bk_sort_type == '6'){
                    tip_word = '主线板块('+bk_zf_num+'日资金进出/'+bk_zf_num+'日涨幅/进榜次数/当日市值增)';
                }else{
                    tip_word = '主线板块('+bk_zf_num+'日涨幅/进榜次数/当日市值增)';
                }
            }
            var stock_zf_num    =   $('.stock-zf-num option:selected').html();
            tip_word2           = '主线个股('+stock_zf_num+'日涨幅/当日涨幅)';
            
            $('.show-1,.show-3 div:eq(0)').html(tip_word);
            $('.show-2,.show-3 div:eq(1)').html(tip_word2);
        },
        "drawChart": function () {
            var data = {};
            data.stockid = '000001';
            data.type = 'd';
            data.market = 'SH';
            data.num = '300';
            $.ajax({
                async: false, // 同步调用
                timeout: 10000, // 超时时间限制为10秒
                url: "/webphp/hchan/zxzz/getKlineChart.php",
                type: 'post',
                data: data,
                dataType: 'json',
                success: function (result) {
                    if (result.success) {
                        $.me.kline_array = result.data;
                    } else {
                        $.me.showMsgAlert(result.reason);
                    }

                },
                error: function () {

                }
            });
            /*$maxV=null;
             $minV=null;

             for(var i=0;i<$.me.kline_array.kline.length;i++){
             for(var j=0;j<$.me.kline_array.kline[i].length;j++){
             if($maxV==null || $.me.kline_array.kline[i][j]>$maxV){
             $maxV=$.me.kline_array.kline[i][j];
             }
             if($minV==null || $.me.kline_array.kline[i][j]<$minV){
             $minV=$.me.kline_array.kline[i][j];
             }

             $.me.option.yAxis.max=Math.ceil((parseInt($maxV,10)+50)/50)*50;
             $.me.option.yAxis.min=Math.floor((parseInt($minV,10)-50)/50)*50;

             }
             }*/
            $.me.option.xAxis.data = $.me.kline_array.kline_x;
            $.me.option.series.data = $.me.kline_array.kline;

            var len = $.me.kline_array.kline_x.length;
            $.me.brushNum = 5;
            $.me.brushScope = [len - $.me.brushNum, len - 1];
            $.me.brushScopeDate = [$.me.kline_array.kline_x[len - $.me.brushNum], $.me.kline_array.kline_x[len - 1]];
            $.me.dateRange[0] = $.me.brushScopeDate[0];
            $.me.dateRange[1] = $.me.brushScopeDate[1];

            $.me.myChart = echarts.init($(".k-draw").get(0));
            $.me.myChart.on('brushSelected', function (params) {
                $.me.brushparams = params;
                var brushComponent = params.batch[0];
                //$.me.brushScope = brushComponent.areas[0].coordRange;
                if(brushComponent.selected[0].dataIndex.length>0){
                    $.me.brushScope = [brushComponent.selected[0].dataIndex[0],brushComponent.selected[0].dataIndex[brushComponent.selected[0].dataIndex.length-1]];
                    $.me.brushNum = $.me.brushScope[1]-$.me.brushScope[0]+1;
                    $.me.brushScopeDate[0] = $.me.kline_array.kline_x[$.me.brushScope[0]];
                    $.me.brushScopeDate[1] = $.me.kline_array.kline_x[$.me.brushScope[1]];

                    $("#k-begin-date").val($.me.brushScopeDate[0].substr(0,4)+'-'+$.me.brushScopeDate[0].substr(4,2)+'-'+$.me.brushScopeDate[0].substr(-2));
                    //$.me.curAnalyseDate = $.me.brushScopeDate[1];

                    var cur_date = $.me.brushScopeDate[1].substr(0,4)+'-'+$.me.brushScopeDate[1].substr(4,2)+'-'+$.me.brushScopeDate[1].substr(-2);
                    $("#k-end-date").val(cur_date);
                    /*if($(".trace-date").html() != cur_date){
                        $(".trace-date").html(cur_date);
                        $.me.reloadData();
                    }*/
                    //if($.me.zoomScope[0]> $.me.brushScope[0] || $.me.zoomScope[1]< $.me.brushScope[1]){
                    //	return false;
                    //}

                    if ($.me.dateRange[0] != $.me.brushScopeDate[0] || $.me.dateRange[1] != $.me.brushScopeDate[1]) {
                        if (!$("#analyse").hasClass("waiting"))
                            $("#analyse").addClass("waiting");
                    } else {
                        $("#analyse").removeClass("waiting");
                    }
                }
            });
            $.me.myChart.on('datazoom', function (params) {
                if (params.batch) {
                    $.me.zoomScope[0] = params.batch[0].start;
                    $.me.zoomScope[1] = params.batch[0].end;
                } else {
                    $.me.zoomScope[0] = params.start;
                    $.me.zoomScope[1] = params.end;
                }
                $.me.updateKDrawLine();
            });
            $.me.myChart.on('click', function (params) {
                $.me.curDate = params.name;
                $.me.showDetails();
            });

            $.me.reloadChart([]);

            /*$.me.myChart.setOption($.me.option, true);
             $.me.myChart.on('datazoom', function (params) {
             $.me.zoomScope[0]=params.start;
             $.me.zoomScope[1]=params.end;
             });

             $.me.myChart.dispatchAction({
             type: 'dataZoom',
             start: $.me.zoomScope[0],
             end: $.me.zoomScope[1]
             });

             $.me.myChart.dispatchAction({
             type: 'brush',
             areas: [
             {
             brushType: 'lineX',
             coordRange: $.me.brushScope,
             xAxisIndex: 0
             }
             ]
             });*/
        },
        "reloadChart": function (dateArray) {
            var points = [];
            if ($.me.isArray(dateArray)) {
                var dir, dd, val;
                for (var i = 0; i < dateArray.length; i++) {
                    dir = dateArray[i].substring(0, 1);
                    dd = dateArray[i].substring(1);
                    val = $.me.kline_array.kline[$.me.kline_array.kline_x.indexOf(dd)][dir == 'u' ? 3 : 2];
                    val = (dir == 'u' ? (val - 25) : (parseInt(val, 10) + 25));
                    points.push({
                        symbolRotate: ( dir == 'u' ? 0 : 180),
                        coord: [dd, val],
                        itemStyle: {
                            normal: {color: dir == 'u' ? 'red' : 'green'}
                        }
                    });
                }
            }
            $.me.option.series.markPoint.data = points;
            $.me.myChart.setOption($.me.option);
            $.me.myChart.dispatchAction({
                type: 'dataZoom',
                start: $.me.zoomScope[0],
                end: $.me.zoomScope[1]
            });
            $.me.myChart.dispatchAction({
                type: 'brush',
                areas: [
                    {
                        brushType: 'lineX',
                        coordRange: $.me.brushScope,
                        xAxisIndex: 0
                    }
                ]
            });
        },
        "initDateRange": function () {
            $.me.dateRange[0] = $.me.brushScopeDate[0];
            $.me.dateRange[1] = $.me.brushScopeDate[1];
        },
        "ava_rgb":function(index, ava_num){
            var begin_rgb   =   $.me.traceBgColorTop20_rgb[index][0];
            var end_rgb     =   $.me.traceBgColorTop20_rgb[index][1];
            var rbg_arr     =   [],
            begin_r         =   begin_rgb[0], begin_g = begin_rgb[1], begin_b = begin_rgb[2],
            end_r           =   end_rgb[0], end_g = end_rgb[1], end_b = end_rgb[2],
            ava_r           =   (end_r-begin_r)/ava_num,
            ava_g           =   (end_g-begin_g)/ava_num,
            ava_b           =   (end_b-begin_b)/ava_num;
            //由深到浅
            for(var i=0;i<ava_num;i++){
                rbg_arr.push("rgb("+begin_r+","+begin_g+","+begin_b+")");
                //rbg_arr.push("rgb("+parseInt(begin_r+ava_r*i)+","+parseInt(begin_g+ava_g*i)+","+parseInt(begin_b+ava_b*i)+")");
            }
            return rbg_arr;
        },
        "fillSortData": function () {
        /*
        数据结构：
            1.板块：
                 进榜次数:
                    0:板块代码
                    1:板块名称
                    2:上榜次数
                    3:总市值(当日市值增加)
                    4:关联板块
                    5:
                    6:
                    7:涨幅(多日值: 1,5,10,20,60,120)
                    8:rgb组颜色
                    9:rgb组
                    10:
        
                多日多榜:
                    0:板块代码
                    1:板块名称
                    2:上榜次数
                    3:总市值(当日市值增加)
                    4:关联板块
                    5:上榜状态累计统计
                    6:比较值
                    7:涨幅(多日值: 1,5,10,20,60,120)
                    8:rgb组颜色
                    9:rgb组
                    10:
        
                板块涨幅(全市场)/板块涨幅(日志内)/笔区间涨幅:
                    0:板块代码
                    1:板块名称
                    2:上榜次数
                    3:总市值(当日市值增加)
                    4:关联板块
                    5:
                    6:
                    7:涨幅(当日值: 1或5或10或20或60或120)
                    8:rgb组颜色
                    9:rgb组
        
                资金进出:
                    0:板块代码
                    1:板块名称
                    2:上榜次数
                    3:总市值(当日市值增加)
                    4:关联板块
                    5:
                    6:
                    7:涨幅(当日值: 1或5或10或20或60或120)
                    8:rgb组颜色
                    9:rgb组
                    10：
                    11:资金进出(当日值: 1或5或10或20或60或120)
        
                市值增加量:
                    0:板块代码
                    1:板块名称
                    2:上榜次数
                    3:总市值(当日市值增加)
                    4:关联板块
                    5:
                    6:
                    7:涨幅(当日值: 1或5或10或20或60或120)
                    8:rgb组颜色
                    9:rgb组
                    10:周期市值增加量(多日值: 1,5,10,20,60,120)
        
                2.股票：
                    0:股票代码
                    1:股票名称
                    2:所属板块
                    3:涨幅(当日值: 1或5或10或20或60或120)
                    4:所属主线板块rgb颜色
                    5:当日涨幅
        */
            //var group_type          =   parseInt($('.group-type').val());
            var group_type          =   3;
            var play_rate_sec       =   parseInt($('.play-rate').val());
            var sort_type           =   $('.bk-sort-type').val();
            var zf_num              =   $('.bk-zf-num').val();
            var stock_sort_type     =   $('.stock-sort-type').val();
            var stock_zf_num        =   $('.stock-zf-num').val();

            //板块 - 今日所有板块数据
            var ups = {}, ups_arr = [], up_name, plates, plateinfo, 
                cur_up_arr, day_count = 0, bk_bjz_desc_arr = {},
                run_once, cur_ups = [], up_all_name = [];
            //日志中 - 剔除板块
            var exclude_arr = {'1':['10-3','20-3'],'2':['10-3','20-3'],'3':['20-3'],'4':['20-3'],'5':['20-3'],'6':['20-3'],'7':['20-3'],'8':['20-3']};
            
            //3全市场 - 板块涨幅 || 4日志内板块涨幅 - 获取前20名数据 || 6资金进出 || 7笔区间涨幅  || 8笔涨幅强度
            if(sort_type == '3' || sort_type == '4' || sort_type == '6' || sort_type == '7' || sort_type == '8'){
                var _key = 1;
                if(sort_type == '6'){
                    _key = 2;
                }else if(sort_type == '7'){
                    _key = 3;
                }else if(sort_type == '8'){
                    _key = 4;
                }
                // 板块汇总
                run_once = true;
                for (var i in $.me.inputData) {
                    if(run_once){
                        plates = $.me.inputData[i][_key][zf_num].split("|");
                        var count = 0;
                        for (var j = 0; j < plates.length; j++) {
                            if(count>=20){
                                break;
                            }
                            plateinfo = plates[j].split("##");
                            up_name = plateinfo[1];
                            var glplatelist = [];
                            if(plateinfo[4] != undefined && plateinfo[4].length>0){
                                var glplateinfo = plateinfo[4].split(",").filter(function (s) {
                                    return s && s.trim();
                                });
                                glplatelist = $.map(glplateinfo,function(value, key){
                                    return value.substr(0,value.length-6);
                                });
                            }
                            if(sort_type == '6'){
                                //板块代码 , 板块名称, 上榜次数, 总市值(当日市值增加),关联板块, , ,涨幅(当日值: 1或5或10或20或60或120),,,,资金进出(当日值: 1或5或10或20或60或120)
                                ups[up_name] = [plateinfo[0], up_name, 0, plateinfo[3], glplatelist, "", 0, plateinfo[2],"","","",plateinfo[5]];
                            }else{
                                //板块代码 , 板块名称, 上榜次数, 总市值(当日市值增加),关联板块, , ,涨幅(当日值: 1或5或10或20或60或120)
                                ups[up_name] = [plateinfo[0], up_name, 0, plateinfo[3], glplatelist, "", 0, plateinfo[2]];
                            }
                            count++;
                        }
                    }

                    plates = $.me.inputData[i][0];
                    for (var j = 0; j < plates.length; j++) {
                        plateinfo = plates[j].split("##");
                        up_name = plateinfo[1];
                        if(ups[up_name] != undefined){
                            //剔除20日涨幅前3
                            if(exclude_arr[sort_type].indexOf(plateinfo[2]) == -1){
                                ups[up_name][2] = ups[up_name][2]+1;//上榜次数
                            }
                        }
                        //剔除20日涨幅前3
                        if(exclude_arr[sort_type].indexOf(plateinfo[2]) == -1){
                            if(up_all_name.indexOf(up_name) == -1){
                                up_all_name.push(up_name);
                            }
                            if(run_once){
                                cur_ups.push(up_name);
                            }
                        }
                    }
                    run_once = false;
                }
                //日志内板块涨幅 : 剔除全市场不在日志内板块
                if(sort_type == '4'){
                    for(var up_name in ups){
                        if(up_all_name.indexOf(up_name) == -1){
                            delete ups[up_name];
                        }
                    }
                }
            }else{
                // 板块汇总
                run_once = true;
                for (var i in $.me.inputData) {
                    plates = $.me.inputData[i][0];
                    day_count++;
                    for (var j = 0; j < plates.length; j++) {
                        plateinfo = plates[j].split("##");
                        //剔除20日涨幅前3
                        if(exclude_arr[sort_type].indexOf(plateinfo[2]) == -1){
                            up_name = plateinfo[1];
                            ups[up_name] = ["", "", 0, "", "", "", 0, "","","",""];

                            if(run_once){
                                cur_ups.push(up_name);
                            }
                        }
                    }
                    run_once = false;
                }

                // 板块数据统计
                for (var i in $.me.inputData) {
                    plates = $.me.inputData[i][0];
                    cur_up_arr = [];
                    for (var j = 0; j < plates.length; j++) {
                        plateinfo = plates[j].split("##");
                        up_name = plateinfo[1];
                        //剔除20日涨幅前3
                        if(exclude_arr[sort_type].indexOf(plateinfo[2]) == -1){
                            ups[up_name][0] = plateinfo[0];//板块代码
                            ups[up_name][1] = plateinfo[1];//板块名称
                            ups[up_name][2] = ups[up_name][2]+1;//上榜次数
                            if(ups[up_name][3] == ''){
                                ups[up_name][3] = plateinfo[3];//总市值(当日市值增加)
                            }
                            if(ups[up_name][7] == ''){
                                if(sort_type == '5'){
                                    ups[up_name][7] = plateinfo[5].split(",")[zf_num];//涨幅(当日值: 1或5或10或20或60或120)
                                }else{
                                    ups[up_name][7] = plateinfo[5].split(",");//涨幅(多日值: 1,5,10,20,60,120)
                                }
                            }
                            if(sort_type == '5' && ups[up_name][10] == ''){
                                ups[up_name][10] = plateinfo[6].split(",")[zf_num];//周期市值增加量(当日值: 1或5或10或20或60或120)
                            }
                            if(ups[up_name][4] == ''){
                                var glplatelist = [];
                                if(plateinfo[4] != undefined && plateinfo[4].length>0){
                                    glplateinfo = plateinfo[4].split(",");
                                    var glplatelist = $.map(glplateinfo,function(value, key){
                                        return value.substr(0,value.length-6);
                                    });
                                }
                                ups[up_name][4] = glplatelist;//关联板块
                            }
                            cur_up_arr.push(up_name);
                        }
                    }
                    //上榜状态累计统计
                    if(sort_type == '2'){
                        for (var up_name in ups){
                            if(cur_up_arr.indexOf(up_name) != -1){
                                ups[up_name][5] += "1";
                            }else{
                                ups[up_name][5] += "0";
                            }
                        }
                    }
                }

                // 比较值计算
                if(sort_type == '2'){
                    for(var up_name in ups){
                        var up_data     =   ups[up_name][5];
                        bk_bjz_desc_arr[up_name] = [];
                        if(parseInt(up_data)>0){
                            var up_index        =   up_data.indexOf(1);//最近进榜日
                            var rate_arr        =   [];
                            //console.log("板块: "+up_name);
                            //console.log("时间由近到远(最近进榜日: 第"+(up_index+1)+"天)： "+up_data);
                            for(var end_day = up_index+1; end_day <= day_count; end_day++){
                                var cur_up_data =   up_data.slice(0, end_day);//最近日期到第N天
                                var up_num      =   cur_up_data.replace(/0/g,'').length;//上榜天数
                                var no_up_num   =   cur_up_data.indexOf(1);//最近未进榜天数
                                //(总数据条数 - 天数/上榜数)+上榜数-最近未进榜天数
                                var cur_rate    =   Math.floor(((day_count - end_day/up_num)+up_num-no_up_num)*100)/100;
                                rate_arr.push(cur_rate);
                                bk_bjz_desc_arr[up_name].push(end_day+"日"+up_num+"榜");
                                //console.log("第 "+ end_day+' 天数据( 上榜天数: '+up_num+' 最近未进榜天数: '+no_up_num+' 比较值：'+cur_rate+'): '+cur_up_data);
                            }
                            //console.log("比较值："+rate_arr.join(","));
                            ups[up_name][6] = Math.max.apply(null, rate_arr);
                            bk_bjz_desc_arr[up_name] = bk_bjz_desc_arr[up_name][rate_arr.indexOf(ups[up_name][6])];
                        }else{
                            ups[up_name][6] = 0;
                            bk_bjz_desc_arr[up_name] ='';
                        }
                    }
                }
            }
            
            //个股 - 今日所有个股数据 - 获取前20名数据
            var stocks=[], up_array_bkNameArr = [];
            var cur_stock_key = 0;
            if(stock_sort_type == '2'){
                cur_stock_key = 1;
            }else if(stock_sort_type == '3'){
                cur_stock_key = 2;
            }else if(stock_sort_type == '4') {
                cur_stock_key = 3;
            }
            for (var i in $.me.inputStockData) {
                var stockinfo = $.me.inputStockData[i][cur_stock_key][stock_zf_num].split("|");
                //var count = 0;
                for (var j = 0; j < stockinfo.length; j++) {
                    /*if(count>=20){
                        break;
                    }*/
                    var _stockinfo = stockinfo[j].split("##");
                    //股票代码, 股票名称 , 所属板块, 涨幅(当日值: 1或5或10或20或60或120),,当日涨幅
                    stocks.push([_stockinfo[0],_stockinfo[1], _stockinfo[2], _stockinfo[3],, _stockinfo[4]]);
                    //count++;
                }
            }

            $.me.up_array_old   =   $.me.up_array;
            $.me.up_array       =   [];
            for (var i in ups) {
                ups_arr.push(ups[i]);
            }
            //板块 - 排序方式
            if(sort_type == '1' || sort_type == '2' || sort_type == '5'){
                ups_arr = ups_arr.sort(function (a, b) {
                    if(sort_type == '1'){
                        //排序方式: 上榜次数+市值增加 倒序
                        return ((b[2] - a[2]) == 0)?b[3] - a[3]:b[2] - a[2];
                    }else if(sort_type == '2'){
                        //排序方式: 比较值计算+市值增加 倒序
                        return ((b[6] - a[6]) == 0)?b[3] - a[3]:b[6] - a[6];
                    }else{
                        //排序方式: 周期市值增加量+市值增加 倒序
                        return ((b[10] - a[10]) == 0)?b[3] - a[3]:b[10] - a[10];
                    }
                });
            }

            //板块 - 获取前20名数据
            var count = 0, rgb_bks = [];
            for (var i in ups_arr) {
                if(count>=20){
                    break;
                }
                up_array_bkNameArr.push(ups_arr[i][1]);
                $.me.up_array.push(ups_arr[i]);

                var cur_bk  = [],glbk_arr;
                cur_bk[0]  = ups_arr[i][0];
                cur_bk[1]  = [];
                cur_bk[1].push(ups_arr[i][1]);
                for(var j in ups_arr[i][4]){
                    glbk_arr = ups_arr[i][4][j].split('(');
                    if(group_type == 1){
                        cur_bk[1].push(glbk_arr[0]);
                    }else{
                        if(group_type == 3 && j == 0){//关联分组2:第一个入栈
                            cur_bk[1].push(glbk_arr[0]);
                        }
                        if(cur_bk[1].indexOf(glbk_arr[0]) == -1){
                            if(parseFloat(glbk_arr[1].replace(')',''))>20){//关联度20%以上
                                cur_bk[1].push(glbk_arr[0]);
                            }
                        }
                    }
                }
                rgb_bks.push(cur_bk);

                count++;
            }
            
            //板块rgb分组
            var rgb_bk_index_arr    =   {};
            var rgb_bks_temp        =   JSON.parse(JSON.stringify(rgb_bks));
            if(group_type == 1){
                for(var cur_index in rgb_bks_temp){
                    cur_index = parseInt(cur_index);
                    if(rgb_bks_temp[cur_index][1].length == 0){
                        continue;
                    }
                    for(var next_index = 0; next_index < rgb_bks_temp.length; next_index++){
                        next_index = parseInt(next_index);
                        if(next_index < cur_index  && rgb_bks_temp[next_index][1].length > 0 && rgb_bks_temp[next_index][3] == undefined){
                            var _same = false,rgb_index = null,name_tip = null;
                            //使用数量最少的板块遍历
                            var compare_arr     =   rgb_bks_temp[cur_index][1];
                            var be_compare_arr  =   rgb_bks_temp[next_index][1];
                            if(rgb_bks_temp[cur_index][1].length > rgb_bks_temp[next_index][1].length){
                                compare_arr     =   rgb_bks_temp[next_index][1];
                                be_compare_arr  =   rgb_bks_temp[cur_index][1];
                            }
                            for(var ii in compare_arr){
                                if(be_compare_arr.indexOf(compare_arr[ii]) != -1){
                                    name_tip = compare_arr[ii];
                                    _same = true;
                                    break;
                                }
                            }
                            if(_same) {
                                if (rgb_bks_temp[next_index][2] != undefined) {
                                    rgb_index = rgb_bks_temp[next_index][2];
                                }else{
                                    rgb_index = parseInt((Object.keys(rgb_bk_index_arr).length == 0)?0:Math.max.apply(null,Object.keys(rgb_bk_index_arr))+1);
                                }

                                rgb_bks[cur_index][2]   =   rgb_index;
                                rgb_bks[next_index][2]  =   rgb_index;

                                rgb_bks_temp[cur_index][2]     =   rgb_index;
                                rgb_bks_temp[next_index][2]    =   rgb_index;
                                rgb_bks_temp[cur_index][3]     =   next_index;

                                //console.log(rgb_bks_temp[cur_index][1][0]+": "+rgb_bks_temp[cur_index][1]);
                                //console.log(rgb_bks_temp[next_index][1][0]+": "+rgb_bks_temp[next_index][1]);
                                //console.log(rgb_bks_temp[cur_index][1][0]+"("+cur_index+") <==关联到==> "+rgb_bks_temp[next_index][1][0]+"("+next_index+") : " + name_tip+'\n\n');

                                if(rgb_bk_index_arr[rgb_index] == undefined){
                                    rgb_bk_index_arr[rgb_index] = [];
                                }
                                for(var jj in rgb_bks_temp[cur_index][1]){
                                    if(rgb_bks_temp[next_index][1].indexOf(rgb_bks_temp[cur_index][1][jj]) == -1){
                                        rgb_bks_temp[next_index][1].push(rgb_bks_temp[cur_index][1][jj]);
                                    }
                                }
                                break;
                            }else{
                                //console.log(cur_index+'====>'+next_index);
                            }
                        }
                    }
                }
            }else{
                for(var cur_index in rgb_bks_temp){
                    cur_index = parseInt(cur_index);
                    // 跳过已被交集主线
                    if(rgb_bks_temp[cur_index][1].length == 0 || rgb_bks_temp[cur_index][3] != undefined){
                        continue;
                    }
                    for(var next_index = 0; next_index < rgb_bks_temp.length; next_index++){
                        next_index = parseInt(next_index);
                        // 跳过cur_index主线 和 已被交集主线
                        if(next_index != cur_index && rgb_bks_temp[next_index][3] == undefined && rgb_bks_temp[next_index][1].length > 0){
                            var _same = false,rgb_index = null,name_tip = null;
                            //使用数量最少的板块遍历
                            var compare_arr     =   rgb_bks_temp[cur_index][1];
                            var be_compare_arr  =   rgb_bks_temp[next_index][1];
                            if(rgb_bks_temp[cur_index][1].length > rgb_bks_temp[next_index][1].length){
                                compare_arr     =   rgb_bks_temp[next_index][1];
                                be_compare_arr  =   rgb_bks_temp[cur_index][1];
                            }
                            for(var ii in compare_arr){
                                if(be_compare_arr.indexOf(compare_arr[ii]) != -1){
                                    name_tip = compare_arr[ii];
                                    _same = true;
                                    break;
                                }
                            }
                            if(_same) {
                                if (rgb_bks_temp[cur_index][2] != undefined) {
                                    rgb_index = rgb_bks_temp[cur_index][2];
                                }else if (rgb_bks_temp[next_index][2] != undefined) {
                                    rgb_index = rgb_bks_temp[next_index][2];
                                }else{
                                    rgb_index = parseInt((Object.keys(rgb_bk_index_arr).length == 0)?0:Math.max.apply(null,Object.keys(rgb_bk_index_arr))+1);
                                }
                                rgb_bks[cur_index][2]       =   rgb_index;
                                rgb_bks[next_index][2]      =   rgb_index;

                                rgb_bks_temp[cur_index][2]  =   rgb_index;
                                rgb_bks_temp[next_index][2] =   rgb_index;
                                rgb_bks_temp[next_index][3] =   rgb_bks_temp[next_index][3] == undefined?''+cur_index:rgb_bks_temp[next_index][3]+' > '+cur_index;

                                //console.log(rgb_bks_temp[cur_index][1][0]+": "+rgb_bks_temp[cur_index][1]);
                                //console.log(rgb_bks_temp[next_index][1][0]+": "+rgb_bks_temp[next_index][1]);
                                //console.log(rgb_bks_temp[cur_index][1][0]+"("+cur_index+") <==关联到==> "+rgb_bks_temp[next_index][1][0]+"("+next_index+") : " + name_tip+'\n\n');

                                if(rgb_bk_index_arr[rgb_index] == undefined){
                                    rgb_bk_index_arr[rgb_index] = [];
                                }
                                for(var jj in rgb_bks_temp[next_index][1]){
                                    if(rgb_bks_temp[cur_index][1].indexOf(rgb_bks_temp[next_index][1][jj]) == -1){
                                        rgb_bks_temp[cur_index][1].push(rgb_bks_temp[next_index][1][jj]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //重新从上到下分组
            var rgb_indexs      =   [],r_num           =   0;
            var rgb_bks_copy    =   JSON.parse(JSON.stringify(rgb_bks));
            for(var r_i in rgb_bks_copy){
                if(rgb_indexs[r_num] == undefined){
                    rgb_indexs[r_num] = [];
                }
                rgb_indexs[r_num].push(r_i);
                if(rgb_bks_copy[r_i][2] != undefined){
                    for(var r_j in rgb_bks_copy){
                        if(parseInt(r_j)>parseInt(r_i) && rgb_bks_copy[r_i][2] == rgb_bks_copy[r_j][2]){
                            rgb_indexs[r_num].push(r_j);
                            delete rgb_bks_copy[r_j];
                        }
                    }
                }
                r_num++;
                delete rgb_bks_copy[r_i];
            }
            for(var i in rgb_indexs){
                for(var j in rgb_indexs[i]){
                    rgb_bks[rgb_indexs[i][j]][2] = i;
                }
            }
            //console.log(rgb_bks_temp);
            for(var i in rgb_bks){
                if(rgb_bks[i][2] == undefined){
                    rgb_bks[i][2] = Math.max.apply(null,Object.keys(rgb_bk_index_arr))+1;
                }
                rgb_index = rgb_bks[i][2];
                if(rgb_bk_index_arr[rgb_index] == undefined){
                    rgb_bk_index_arr[rgb_index] = [];
                }
                rgb_bk_index_arr[rgb_index].push(i);
            }
            // console.log('RGB颜色组:');
            // var console_print = JSON.parse(JSON.stringify(rgb_bk_index_arr));
            // for(var i in console_print){
            //     var p = '';
            //     for(var j in console_print[i]){
            //         p += rgb_bks[console_print[i][j]][1][0]+',';
            //     }
            //     console.log('第 '+(parseInt(i)+1)+' 组：'+p.substr(0,p.length-1));
            // }

            // rgb组 - 渐变色块
            var rgb_i = 0;
            for(var i in rgb_bk_index_arr){
                if(rgb_bk_index_arr[i].length > 0){
                    rgb_bk_index_arr[i] = $.me.ava_rgb(rgb_i,rgb_bk_index_arr[i].length);
                    rgb_i++;
                }
            }

            // 板块对应的rgb组色块
            for(var i in $.me.up_array){
                var up_rgb_index = (rgb_bks[i][2] != undefined)?rgb_bks[i][2]:null;
                if(up_rgb_index != null){
                    $.me.up_array[i][8] = rgb_bk_index_arr[up_rgb_index][0];
                    rgb_bk_index_arr[up_rgb_index].splice(0,1);
                }else{
                    //不在rgb组内 - 颜色随机
                    $.me.up_array[i][8] = $.me.traceBgColorTop20[i];
                }
                $.me.up_array[i][9] = up_rgb_index;
            }
            
            //板块 - 上日板块存在今日队列中：复用所属底色
            $.me.traceBkTop20_old       =   $.me.traceBkTop20;
            var traceBk_empty_state     =   true,traceBkTop20_old_temp   =   {};
            if(!$.isEmptyObject($.me.traceBkTop20_old)){
                traceBk_empty_state     =   false;
                for (var i in $.me.up_array) {
                    if(!$.isEmptyObject($.me.traceBkTop20_old[$.me.up_array[i][0]])){
                        traceBkTop20_old_temp[$.me.up_array[i][0]] = $.me.traceBkTop20_old[$.me.up_array[i][0]];
                    }
                }
            }
            $.me.traceBkTop20_old       =   traceBkTop20_old_temp;
            
            //板块 - 今日队列中除上日板块,其它板块颜色设定
            $.me.traceBkTop20           =   {};
            for (var i in $.me.up_array) {
                if($.isEmptyObject($.me.traceBkTop20[$.me.up_array[i][0]]))
                    $.me.traceBkTop20[$.me.up_array[i][0]]          =   {};
                $.me.traceBkTop20[$.me.up_array[i][0]]['group']     =   $.me.up_array[i][9];
                if(traceBk_empty_state){
                    $.me.traceBkTop20[$.me.up_array[i][0]]['bgcolor']   =   $.me.up_array[i][8];
                }else{
                    if($.isEmptyObject($.me.traceBkTop20_old[$.me.up_array[i][0]])){
                        $.me.traceBkTop20[$.me.up_array[i][0]]['bgcolor']   =   $.me.up_array[i][8];
                    }else{
                        //当前rgb组颜色优先
                        if($.me.up_array[i][9] != null){
                            $.me.traceBkTop20[$.me.up_array[i][0]]['bgcolor']   =   $.me.up_array[i][8];
                        }else{
                            //上一日未落在当日的RGB组内
                            if(Object.keys(rgb_bk_index_arr).indexOf(parseInt($.me.traceBkTop20_old[$.me.up_array[i][0]]['group']).toString()) == -1){
                                $.me.traceBkTop20[$.me.up_array[i][0]]['bgcolor']   =   $.me.traceBkTop20_old[$.me.up_array[i][0]]['bgcolor'];
                                $.me.up_array[i][8]                                 =   $.me.traceBkTop20_old[$.me.up_array[i][0]]['bgcolor'];
                            }else{
                                $.me.traceBkTop20[$.me.up_array[i][0]]['bgcolor']   =   $.me.up_array[i][8];
                            }
                        }
                    }
                }
            }
            
            //个股 - 所属板块在前20名板块中,置前
            $.me.up_stock_array_old     =   $.me.up_stock_array;
            var stock_up_names          =   [],default_none_color = '#ccc';
            $.me.up_stock_array         =   [];
            up_array_bkNameArr          =   up_array_bkNameArr.reverse();
            var count = 0;
            for(var j in stocks){
                if(count>=20){
                    break;
                }
                //存在主线板块 - 置前
                var _continue=true;
                for(var jj in up_array_bkNameArr){
                    if(stocks[j][2].indexOf(up_array_bkNameArr[jj]) != -1){
                        _continue=false;
                        var bknameArr = stocks[j][2].split(",");
                        for(var jjj in bknameArr){
                            if(bknameArr[jjj] == up_array_bkNameArr[jj]){
                                delete bknameArr[jjj];
                            }
                        }
                        bknameArr.unshift(up_array_bkNameArr[jj]);
                        stocks[j][2] = bknameArr.join(',');
                    }
                }
                if(stock_sort_type == '1' && _continue){
                    continue;
                }
                //同排名主线板块 - 存在置前
                if($.me.up_array.length>=j+1){
                    var same_index_bk_name = $.me.up_array[j][1];
                    if(stocks[j][2].indexOf(same_index_bk_name) != -1){
                        var bknameArr = stocks[j][2].split(",");
                        for(var jjj in bknameArr){
                            if(bknameArr[jjj] == same_index_bk_name){
                                delete bknameArr[jjj];
                            }
                        }
                        bknameArr.unshift(same_index_bk_name);
                        stocks[j][2] = bknameArr.join(',');
                    }
                }
                var bknameArr = stocks[j][2].split(",");
                stocks[j][2] = bknameArr.filter(function (s) {
                    return s && s.trim();
                });
                if(stocks[j][2] != undefined && stocks[j][2].length>0){
                    for(var jjj in $.me.up_array){
                        if($.me.up_array[jjj][1] == stocks[j][2][0]){
                            stocks[j][4] = $.me.up_array[jjj][8];
                            if(stock_up_names.indexOf($.me.up_array[jjj][1]) == -1){
                                stock_up_names.push($.me.up_array[jjj][1]);
                            }
                            break;
                        }
                    }
                }
                //非主线内 - 统一底色
                if(stocks[j][4] == undefined){
                    stocks[j][4] = default_none_color;
                }
                $.me.up_stock_array.push(stocks[j]);
                count++;
            }

            //个股 - 上日个股存在今日队列中：复用所属底色
            $.me.traceStockTop20_old    =   $.me.traceStockTop20;
            var traceStock_empty_state  =   true,traceStockTop20_old_temp =   {};
            if(!$.isEmptyObject($.me.traceStockTop20_old)){
                traceStock_empty_state  =   false;
                for (var i in $.me.up_stock_array) {
                    if(!$.isEmptyObject($.me.traceStockTop20_old[$.me.up_stock_array[i][0]])){
                        traceStockTop20_old_temp[$.me.up_stock_array[i][0]] = $.me.traceStockTop20_old[$.me.up_stock_array[i][0]];
                    }
                }
            }
            $.me.traceStockTop20_old       =   traceStockTop20_old_temp;

            //个股 - 今日队列中除上日个股,其它个股颜色设定
            $.me.traceStockTop20        =   {};
            for (var i in $.me.up_stock_array) {
                if($.isEmptyObject($.me.traceStockTop20[$.me.up_stock_array[i][0]]))
                    $.me.traceStockTop20[$.me.up_stock_array[i][0]]      =   {};
                if(traceStock_empty_state){
                    $.me.traceStockTop20[$.me.up_stock_array[i][0]]      =   $.me.up_stock_array[i][4];
                }else{
                    $.me.traceStockTop20[$.me.up_stock_array[i][0]]      =   $.me.up_stock_array[i][4];
                    /*if($.isEmptyObject($.me.traceStockTop20_old[$.me.up_stock_array[i][0]])){
                        $.me.traceStockTop20[$.me.up_stock_array[i][0]]  =   $.me.up_stock_array[i][4];
                    }else{
                        $.me.traceStockTop20[$.me.up_stock_array[i][0]]  =   $.me.traceStockTop20_old[$.me.up_stock_array[i][0]];
                        $.me.up_stock_array[i][4]                        =   $.me.traceStockTop20_old[$.me.up_stock_array[i][0]];
                    }*/
                }
            }

            var heights             =   $.me.cellHeight(parseInt($(".show-num").val()));
            var sort_body_height    =   parseFloat(heights[0]);
            var div_height          =   parseFloat(heights[1]);
            var gl_height           =   parseFloat(heights[2]);
            var marginTop           =   parseFloat(heights[3]);
            var body_dom            =   $(".sort-table.up .sort-body");

            //停止当前动画，继续下一个动画
            //$(".sort-table.up .sort-body .sort-cell").stop();
            //清除元素的所有动画
            //$(".sort-table.up .sort-body .sort-cell").stop(true);
            //让当前动画直接到达末状态 ，继续下一个动画
            //$(".sort-table.up .sort-body .sort-cell").stop(false, true);
            //清除元素的所有动画，让当前动画直接到达末状态
            $(".sort-table.up .sort-body .sort-cell").stop(true, true);
            $(".sort-table.up .sort-body .sort-cell.remove-cell").remove();

            //板块 - 页面元素 - 本次不在列表的板块移除
            for(var index=0;index<$.me.up_array_old.length;index++){
                var not_exist = true;
                for(var code in $.me.traceBkTop20){
                    if($.me.up_array_old[index][0] == code){
                        not_exist = false;
                    }
                }
                //不存在
                if(not_exist){
                    var this_dom    =   body_dom.find(".sort-cell[bid='su"+$.me.up_array_old[index][0]+"']");
                    var last_pm     =   parseInt(this_dom.find('span.pm').html());
                    $.me.animateValue(this_dom,last_pm,0);
                    this_dom.addClass('remove-cell');
                    this_dom.animate({'top':parseFloat(sort_body_height)+'px'},play_rate_sec,
                    function(){
                        $(this).fadeOut(play_rate_sec+100,function(){$(this).remove()});
                    });
                }
            }

            //个股 - 页面元素 - 本次不在列表的个股移除
            for(var index=0;index<$.me.up_stock_array_old.length;index++){
                var not_exist = true;
                for(var stock in $.me.traceStockTop20){
                    if($.me.up_stock_array_old[index][0] == stock){
                        not_exist = false;
                    }
                }
                //不存在
                if(not_exist){
                    var this_dom    =   body_dom.find(".sort-cell[bid='su"+$.me.up_stock_array_old[index][0]+"']");
                    var last_pm     =   parseInt(this_dom.find('span.pm').html());
                    $.me.animateValue(this_dom,last_pm,0);
                    this_dom.addClass('remove-cell');
                    this_dom.animate({'top':parseFloat(sort_body_height)+'px'},play_rate_sec,
                    function(){
                        $(this).fadeOut(play_rate_sec+100,function(){$(this).remove()});
                    });
                }
            }

            //页面元素 - 整体宽度调整
            var add_bk_width = 0, add_stock_width = 0, bk = false, stock = false;
            if($('.select-bk').hasClass('selected'))
                bk = true;
            if($('.select-stock').hasClass('selected'))
                stock = true;
            if(!bk || !stock){
                if(bk){
                    add_bk_width = 562;
                }else{
                    add_stock_width = 562;
                }
            }
            
            //板块 - 页面元素填充
            var body_bk_dom         =   $(".sort-table.up .sort-body.sort-bk-body");
            var strhtml             =   '',cell_width;
            if($.me.up_array.length>0){
                if(sort_type == '1'){
                    //排序方式: 上榜次数
                    var __max            =   parseInt($.me.up_array[0][2]);
                    var __min              =   parseInt($.me.up_array[$.me.up_array.length-1][2]);
                }else if(sort_type == '2'){
                    //排序方式: 比较值
                    var __max             =   parseFloat($.me.up_array[0][6]);
                    var __min             =   parseFloat($.me.up_array[$.me.up_array.length-1][6]);
                }else if(sort_type == '5'){
                    //周期市值增加量
                    var __max             =   parseFloat($.me.up_array[0][10]);
                    var __min             =   parseFloat($.me.up_array[$.me.up_array.length-1][10]);
                }else if(sort_type == '6'){
                    //资金进出
                    var __max             =   parseFloat($.me.up_array[0][11]);
                    var __min             =   parseFloat($.me.up_array[$.me.up_array.length-1][11]);
                }else{
                    //3排序方式: 全市场 - 板块涨幅 || 4排序方式: 日志内板块涨幅 || 7排序方式: 笔区间涨幅 || 8排序方式: 笔涨幅强度
                    var __max             =   parseFloat($.me.up_array[0][7]);
                    var __min             =   parseFloat($.me.up_array[$.me.up_array.length-1][7]);
                }
                for (var index = 0; index < $.me.up_array.length; index++) {
                    var bk_code     =   $.me.up_array[index][0];
                    var bk_name     =   $.me.up_array[index][1];
                    var bk_pm       =   parseInt($.me.up_array[index][2]);//上榜次数
                    var bk_gl       =   $.me.up_array[index][4];//关联板块
                    var bk_inc      =   parseFloat($.me.up_array[index][3]).toFixed(1);//总市值(当日市值增加)
                    //板块名称
                    var bk_name_desc=   '<span class="bk-name" bk-name="'+bk_name+'">'+'_REPLACE_'+'</span>';
                    bk_name_desc    =   (cur_ups.indexOf(bk_name) != -1)?'*'+bk_name_desc:bk_name_desc;

                    //元素宽度
                    var cur_value   =   null;
                    var bk_desc     =   '';
                    if(sort_type == '1'){
                        //排序方式: 上榜次数
                        cur_value   =   bk_pm;
                    }else if(sort_type == '2'){
                        //排序方式: 比较值
                        var bk_bjz  =   parseFloat($.me.up_array[index][6]);
                        cur_value   =   bk_bjz;
                        bk_desc     =   bk_bjz_desc_arr[bk_name];
                    }else if(sort_type == '5'){
                        //周期市值增加量
                        var bk_zf   =   parseFloat($.me.up_array[index][10]);
                        cur_value   =   bk_zf;
                        bk_desc     =   bk_zf+'/'+$.me.up_array[index][7]+'%';
                    }else if(sort_type == '6'){
                        //资金进出
                        var bk_zf   =   parseFloat($.me.up_array[index][11]);
                        cur_value   =   bk_zf;
                        bk_desc     =   (Math.round(bk_zf/100000000*10)/10).toFixed(1)+'/'+$.me.up_array[index][7]+'%';
                    }else{
                        //3排序方式: 全市场 - 板块涨幅 || 4排序方式: 日志内板块涨幅 || 7排序方式: 笔区间涨幅 || 8排序方式: 笔涨幅强度
                        var bk_zf   =   parseFloat($.me.up_array[index][7]);
                        cur_value   =   bk_zf;
                        bk_desc     =   bk_zf+'%';
                    }
                    //板块名称+(自定义内容)
                    if(sort_type == '1'){
                        bk_name_desc   +=   '(<span class="pm">' + bk_pm +'</span>/' + bk_inc + ')';
                    }else{
                        bk_name_desc   +=   '('+ bk_desc + '/<span class="pm">' + bk_pm +'</span>/' + bk_inc + ')';
                    }

                    var rate = (__max == __min)?19:(cur_value - __min)*(19/(__max - __min));
                    cell_width = (238+add_bk_width+16*rate)+'px';

                    //板块信息长度控制
                    var bk_name_desc_temp = bk_name_desc.replace('_REPLACE_', '').replace(/<[^>]*>/g, '')+bk_name;
                    var title_str = '';
                    //字节长度极限控制在25/240  25:板块信息 240:板块长度
                    if(Math.round(bk_name_desc_temp.replace(/[^\x00-\xff]/g,"aa").length/parseFloat(cell_width)*100)/100 > Math.round(25/240*100)/100){
                        title_str       =   " title='"+((cur_ups.indexOf(bk_name) != -1)?'*'+bk_name:bk_name)+"'";
                        bk_name_desc    =   bk_name_desc.replace('_REPLACE_', bk_name.substr(0,2)+'...');
                    }else{
                        bk_name_desc    =   bk_name_desc.replace('_REPLACE_', bk_name);
                    }
                    
                    //关联板块
                    var gl_html = '<div class="gl-more gl-list">...</div>';
                    if(bk_gl.length>0){
                        if(bk_gl.length == 1){
                            var gl_name =   bk_gl[0].split('(')[0];
                            var val     =   gl_name.length>4?gl_name.substr(0,4)+'...':gl_name;
                            gl_html     =   '<div class="gl-more gl-list" ' +
                                'title="'+gl_name+'">...</div>' +
                                '<div class="gl-div gl-list">'+val+'</div>';
                        }else{
                            var gl_str = '';
                            for(var jj = 0; jj < bk_gl.length; jj++){
                                gl_str +='&nbsp;&nbsp;&nbsp;'+bk_gl[jj];
                            }
                            var gl_name1    =   bk_gl[0].split('(')[0];
                            //var gl_name2    =   bk_gl[1].split('(')[0];
                            var val         =   gl_name1.length>4?gl_name1.substr(0,4)+'...':gl_name1;
                            //var val2        =   gl_name2.length>4?gl_name2.substr(0,4)+'...':gl_name2;
                            //if(parseFloat(cell_width) < 283){
                                gl_html         =   '<div class="gl-more gl-list" title="'+gl_str+'">...</div>' +
                                    '<div class="gl-div gl-list">'+val+'</div>';
                            //}else{
                            //     gl_html         =   '<div class="gl-more gl-list" title="'+gl_str+'">...</div>' +
                            //         '<div class="gl-div gl-list">'+val2+'</div>' +
                            //         '<div class="gl-div gl-list">'+val+'</div>';
                            // }
                        }
                    }
                    //排名板块
                    strhtml =   '<div class="sort-cell bk-cell" ' +
                        'pm="' + bk_pm +
                        '" index="' + index +
                        '" bid="su' + bk_code +
                        '" style="background-color: ' +
                        $.me.traceBkTop20[bk_code]['bgcolor']+'">' +
                        '<span'+title_str+'>' + bk_name_desc +
                        '</span>'+gl_html+
                        '</div>';

                    var last_index      =   null;
                    //上次排名
                    if(!$.isEmptyObject($.me.up_array_old)){
                        for(var last_i in $.me.up_array_old){
                            if($.me.up_array_old[last_i][0] == bk_code){
                                last_index = last_i;
                                break;
                            }
                        }
                    }
                    var move_px_ava     =   parseFloat(div_height)+parseFloat(marginTop);//平均移动距离
                    var move_px         =   index*move_px_ava;
                    if(last_index === null){//上次不存在于列表
                        body_bk_dom.append(strhtml);
                        var this_dom    =   body_bk_dom.find(".sort-cell[bid='su"+bk_code+"']");
                        this_dom.css({'top': parseFloat(sort_body_height)+'px','width': '220px'});
                        $.me.animateValue(this_dom,0,bk_pm);
                    }else{//上次存在于列表
                        var this_dom    =   body_bk_dom.find(".sort-cell[bid='su"+bk_code+"']");
                        var last_pm     =   parseInt(this_dom.attr('pm'));
                        strhtml         =   '<span'+title_str+'>' + bk_name_desc + '</span>'+gl_html;
                        this_dom.attr({'pm': bk_pm, "index": index}).css('background-color',$.me.traceBkTop20[bk_code]['bgcolor']).html(strhtml);
                        $.me.animateValue(this_dom,last_pm,bk_pm);
                    }
                    body_bk_dom.find(".sort-cell[bid='su"+bk_code+"']").animate({'top':move_px+'px','width':cell_width},play_rate_sec);
                }
            }

            //个股 - 页面元素填充
            var body_stock_dom      =   $(".sort-table.up .sort-body.sort-stock-body");
            var strhtml             =   '',cell_width;
            if($.me.up_stock_array.length>0){
                var max_inc             =   parseFloat($.me.up_stock_array[0][3]);
                var min_inc             =   parseFloat($.me.up_stock_array[$.me.up_stock_array.length-1][3]);
                for (var index = 0; index < $.me.up_stock_array.length; index++) {
                    var stock_id        =   $.me.up_stock_array[index][0];
                    var stock_name      =   $.me.up_stock_array[index][1];
                    var stock_hname     =   ($.me.hState == 1)?'XXXX':stock_name;
                    var stock_bks       =   $.me.up_stock_array[index][2];
                    var stock_inc       =   $.me.up_stock_array[index][3];
                    var stock_cur_inc   =   $.me.up_stock_array[index][5];

                    //元素宽度
                    var rate = (max_inc == min_inc)?19:(parseFloat(stock_inc) - min_inc)*(19/(max_inc - min_inc));
                    cell_width = (238+add_stock_width+16*rate)+'px';

                    //所属板块
                    var bk_html = '';
                    if(stock_bks.length>0){
                        var bk_str = '';
                        for(var jj = 0; jj < stock_bks.length; jj++){
                            bk_str +='&nbsp;&nbsp;&nbsp;'+
                                ((up_array_bkNameArr.indexOf(stock_bks[jj]) != -1)?'*'+stock_bks[jj]:stock_bks[jj]);
                        }
                        var bk_name    =   stock_bks[0];
                        var color_style = '';
                        // if(up_array_bkNameArr.indexOf(bk_name) != -1){
                        //     color_style = ' style="color:red;" ';
                        // }
                        var val         =   bk_name.length>4?bk_name.substr(0,4)+'...':bk_name;
                        bk_html         =   '<div class="gl-more gl-list" title="'+bk_str+'">...</div>' +
                            '<div class="gl-div gl-list"'+color_style+'>'+val+'</div>';
                    }
                    //排名板块
                    strhtml =   '<div class="sort-cell" ' +
                        ' index="' + index +
                        '" bid="su' + stock_id +
                        '" style="background-color: ' +
                        $.me.traceStockTop20[stock_id]+'">' +
                        '<span><span class="sort-cell-stock" data-name="'+stock_name+'">' + stock_hname + '</span>(' + stock_inc +'/' + stock_cur_inc +')</span>'+bk_html+
                        '</div>';

                    var last_index      =   null;
                    //上次排名
                    if(!$.isEmptyObject($.me.up_stock_array_old)){
                        for(var last_i in $.me.up_stock_array_old){
                            if($.me.up_stock_array_old[last_i][0] == stock_id){
                                last_index = last_i;
                                break;
                            }
                        }
                    }
                    var move_px_ava     =   parseFloat(div_height)+parseFloat(marginTop);//平均移动距离
                    var move_px         =   index*move_px_ava;
                    if(last_index === null){//上次不存在于列表
                        body_stock_dom.append(strhtml);
                        var this_dom    =   body_stock_dom.find(".sort-cell[bid='su"+stock_id+"']");
                        this_dom.css({'top': parseFloat(sort_body_height)+'px','width': '220px'});
                    }else{//上次存在于列表
                        var this_dom    =   body_stock_dom.find(".sort-cell[bid='su"+stock_id+"']");
                        strhtml         =   '<span><span class="sort-cell-stock" data-name="'+stock_name+'">' + stock_hname + '</span>(' + stock_inc + '/' + stock_cur_inc + ')</span>'+bk_html;
                        this_dom.attr({"index": index}).css('background-color',$.me.traceStockTop20[stock_id]).html(strhtml);
                    }

                    body_stock_dom.find(".sort-cell[bid='su"+stock_id+"']").animate({'top':move_px+'px','width':cell_width},play_rate_sec);
                }
            }

            //页面元素 - 整体高宽调整
            var cell_dom            =   body_dom.find(".sort-cell");
            var gl_dom              =   cell_dom.find('.gl-list');
            body_dom.css('height',sort_body_height+"px");
            cell_dom.css({'height':div_height+"px",'line-height':div_height+"px"});
            gl_dom.css({'height':gl_height+"px", 'line-height':gl_height+"px"});
        },
        //排名名次变化
        "animateValue":function(obj, start, end) {
            var range = end - start;
            var duration = 1000;
            if(range == 0){
                obj.find('span.pm').html(end);
            }else{
                var current = start;
                var increment = end > start? 1 : -1;
                var stepTime = Math.abs(Math.floor(duration / range));
                var timer = setInterval(function() {
                    current += increment;
                    obj.find('span.pm').html(current);
                    if (current == end) {
                        clearInterval(timer);
                    }
                }, stepTime);
            }
        },
        "addEvent": function () {
            Date.prototype.pattern = function (fmt) {
                var o = {
                    "M+": this.getMonth() + 1, //月份
                    "d+": this.getDate(), //日
                    "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
                    "H+": this.getHours(), //小时
                    "m+": this.getMinutes(), //分
                    "s+": this.getSeconds(), //秒
                    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                    "S": this.getMilliseconds() //毫秒
                };
                var week = {
                    "0": "\u65e5",
                    "1": "\u4e00",
                    "2": "\u4e8c",
                    "3": "\u4e09",
                    "4": "\u56db",
                    "5": "\u4e94",
                    "6": "\u516d"
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                if (/(E+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    }
                }
                return fmt;
            };

            $("#content").delegate("div", "click", function (e) {
                if (!$(this).hasClass("focus") && $("#stocks").hasClass("ui-dialog-content")) {
                    $("#stocks").dialog("close");
                }
                e.stopPropagation();
            });
            $("#content").click(function (e) {
                if (e.target.id == "content" && $("#stocks").hasClass("ui-dialog-content")) {
                    $("#stocks").dialog("close");
                }
            });

            /*$(".cal-body").delegate("td>div>div", "click", function () {
                var bid, kid, dir, dt, dirname, platename;
                var $this = $(this);
                bid = $this.attr("bid").substr(1);
                //dir = $this.attr("bid").substr(0, 1);
                //$.me.curDir = dir;
                $.me.curPlate = [bid, $this.find('span:eq(0)').text()];
                $.me.curDate = $this.closest("tr").attr("id").substr(1);

                $(".cal-body div.focus").removeClass('focus');
                $('.sort-table .focus').removeClass('focus');
                /!*if(dir=='u'){
                 $(".sort-table.up div[bid=su"+bid+"]").addClass("focus");
                 }else{
                 $(".sort-table.down div[bid=sd"+bid+"]").addClass("focus");
                 }*!/
                $(".sort-table.up div[bid=su" + bid + "]").addClass("focus");
                //$(".sort-table.down div[bid=sd" + bid + "]").addClass("focus");

                var dateArray = [], plateinfo, plates;

                for (var i in $.me.inputData) {
                    //	if(dir=='u') {
                    plates = $.me.inputData[i][0];
                    for (var j = 0; j < plates.length; j++) {
                        plateinfo = plates[j].split("##");
                        if (plateinfo[0] == bid) {
                            dateArray.push(i.replace('d', 'u'));
                            $('#' + i + " div.up>div[bid=u" + bid + "]").addClass("focus");
                        }
                    }
                    //	}else {
                    /!*plates = $.me.inputData[i][1];
                    for (var j = 0; j < plates.length; j++) {
                        plateinfo = plates[j].split("##");
                        if (plateinfo[0] == bid) {
                            dateArray.push(i);
                            $('#' + i + " div.down>div[bid=d" + bid + "]").addClass("focus");
                        }
                    }*!/
                    //	}
                }
                /!*$.me.reloadChart(dateArray);*!/
                $.me.showDetails();
            });*/

            /*$(".sort-table").delegate(".sort-cell.bk-cell", "click", function () {
                var $this = $(this);
                var bid = $this.attr("bid").substr(2);
                //var dir = $this.attr("bid").substr(1, 1);
                var dateArray = [];
                $(".sort-table div.sort-cell.focus").removeClass('focus');
                $(".sort-table.up div[bid=su" + bid + "]").addClass("focus");
                //$(".sort-table.down div[bid=sd" + bid + "]").addClass("focus");
                //	$this.addClass("focus");
                $(".cal-body div.focus").removeClass('focus');
                $.me.curPlate = [bid, $this.find('span.bk-name').text()];
                //$.me.curDir = dir;
                var dd = 0, //最大日期
                    dt, //循环体中的临时日期
                    plates,
                    plateinfo;

                for (var i in $.me.inputData) {
                    dt = i.replace('d', '');
                    //		if(dir=='u') {
                    plates = $.me.inputData[i][0];
                    for (var j = 0; j < plates.length; j++) {
                        plateinfo = plates[j].split("##");
                        if (plateinfo[0] == bid) {
                            dateArray.push('u' + dt);
                            $('#' + i + " div.up>div[bid=u" + bid + "]").addClass("focus");
                            //if (dir == 'u' && dt > dd)
                            if (dt > dd)
                                dd = dt;
                        }
                    }
                    //		}else {
                    /!*plates = $.me.inputData[i][1];
                    for (var j = 0; j < plates.length; j++) {
                        plateinfo = plates[j].split("##");
                        if (plateinfo[0] == bid) {
                            dateArray.push('d' + dt);
                            $('#' + i + " div.down>div[bid=d" + bid + "]").addClass("focus");
                            if (dir == 'd' && dt > dd)
                                dd = dt;
                        }
                    }*!/
                    //		}
                }

                /!*for(var i=0;i<$.me.inputData.length;i++){
                 if($.me.inputData[i][0]>= $.me.brushScope[0] && $.me.inputData[i][0]<=$.me.brushScope[1]){
                 if(dir=='u') {
                 for (var j = 0; j < $.me.inputData[i][1].length; j++) {
                 if($.me.inputData[i][1][j][0]==bid) {
                 dateArray.push('u'+$.me.inputData[i][0]);
                 $('#d'+$.me.inputData[i][0]+" div.up>div[bid=u"+bid+"]").addClass("focus");
                 if($.me.inputData[i][0]>dd)
                 dd=$.me.inputData[i][0];
                 }
                 }
                 }else {
                 for (var j = 0; j < $.me.inputData[i][2].length; j++) {
                 if($.me.inputData[i][2][j][0]==bid) {
                 dateArray.push('d'+$.me.inputData[i][0]);
                 $('#d'+$.me.inputData[i][0]+" div.down>div[bid=d"+bid+"]").addClass("focus");
                 if($.me.inputData[i][0]>dd)
                 dd=$.me.inputData[i][0];
                 }
                 }
                 }
                 }
                 }*!/
                if(dd != 0 && dd != undefined){
                    $.me.curDate = dd;
                    $.me.setScrollPos(dd);
                }else{
                    $.me.curDate = $('.cal-body td:eq(0)').html();
                    $(".cal-body tr.cur").removeClass("cur");
                }
                /!*$.me.reloadChart(dateArray);*!/
                $.me.showDetails();
            });*/

            $(".sort-table").delegate(".sort-more", "click", function () {
                $this = $(this);
                if ($this.hasClass("up")) {
                    $this.prev().css("height", "28px");
                    $this.removeClass("up").addClass("down").css("background-image", "url(/echan/images/down.gif)");
                } else {
                    $this.prev().css("height", "auto");
                    $this.removeClass("down").addClass("up").css("background-image", "url(/echan/images/up.gif)");
                }
            });

            $("#stocks").delegate("button", "click", function () {
                $("#stocks button.cur").removeClass("cur");
                $(this).addClass("cur");

                if($(this).attr("id")=='fenshi_btn'){
                    $.me.drawChartMin();
                }else{
                    $.me.drawChartDay();
                }
            });
        },
        "setScrollPos": function (did) {
            $(".cal-body").scrollTop($("#d" + did).get(0).offsetTop + 1);
            $(".cal-body tr.cur").removeClass("cur");
            $("#d" + did).addClass("cur");
        },
        "getData": function () {
            var data = {};
            var url = "/webphp/hchan/zxzz/getData.php";
            data.api_name='mytest';
            //data.filename=$.me.plateType;
            //data.filename='gn';
            data.interval=($('#statistics-date').val().length>0)?parseInt($('#statistics-date').val()):10;
            data.sid=$.me.sid;
            //data.s=$.me.brushScopeDate[0];
            //data.e=$.me.brushScopeDate[1];
            data.date=$.me.curAnalyseDate;
            $.ajax({
                async: false, // 同步调用
                timeout: 10000, // 超时时间限制为10秒
                url: url,
                data:data,
                type: 'get',
                dataType: 'json',
                success: function (result) {
                    if (result.success) {
                        $.me.inputData = result.data['plate'];
                        $.me.inputStockData = result.data['stock'];
                        if(data.date == null) {
                            for (var i in result.data['plate']) {
                                $.me.curAnalyseDate =   i.replace('d', '');
                                $.me.max_date       =   i.replace('d', '');
                                $.me.last_play_idx  =   parseInt($.me.arrayIndexOf($.me.option.xAxis.data, $.me.curAnalyseDate));
                                break;
                            }
                        }
                    } else {
                        $.me.showMsgAlert(result.reason);
                    }

                },
                error: function (result) {
                    $.me.showMsgAlert(result.reason);
                }
            });
        },
        "fillTable": function () {
            var strhtml = '', plates, plateinfo, tip;

            for (var i in $.me.inputData) {
                strhtml += '<tr id="' + i + '"><td width="80">' + i.replace('d', '') + '</td><td>';
                strhtml += '<div class="up">';
                plates = $.me.inputData[i][0];
                for (var j = 0; j < plates.length; j++) {
                    plateinfo = plates[j].split("##");
                    tip = parseInt(plateinfo[2].substr(0,2));
                    strhtml += '<div bid="u' + plateinfo[0] + '" title="'+ plateinfo[1]+'"><span>' + plateinfo[1];
                    strhtml += '</span><i class="cal-up-tip">'+tip+'</i></div>';
                }
                strhtml += '</div></td></tr>';
            }
            $(".cal-body table").html(strhtml);

            if($(".cal-body table tbody tr").length){
                var cur_date = $(".cal-body table tbody tr").eq(0).attr('id').substr(1);
                var cur_date = cur_date.substr(0,4)+'-'+cur_date.substr(4,2)+'-'+cur_date.substr(-2);

                $('.trace-date').html(cur_date);
            }
        },
        "drawStocksTable": function () {
            var api=$('#stocks-table').dataTable().api();
            api.destroy();
            $('#stocks-table body').empty();

            var url="/webphp/hchan/zxzz/getData.php?api_name=mytest_stocks&date="+$.me.curDate+"&id="+$.me.curPlate[0]+"&sid="+$.me.sid;

            $('#stocks-table').DataTable( {
                "ajax": {
                    "url": url,
                    "dataSrc":function ( json ) {
                        var result=[];
                        if(json.data){
                            for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
                                stk=json.data[i].split("##");
                                result.push({'stock_name':stk[1],'stock_id':stk[0],'rise_rate':stk[2],'limit_time':stk[3].substring(0,5),'continue_days':stk[4],'is_fall':stk[5],'count5':stk[6],'memo':stk[7]});
                            }
                        }
                        return result;
                    }
                },
                "processing":false,
                "columnDefs": [
                    {
                        "targets": [0],
                        "render": function ( data, type, row ) {
                            if($.me.hState == 1)
                                return 'XXXX';
                            return data;
                        }
                    },
                    {
                        "targets": [1],
                        "render": function ( data, type, row ) {
                            if($.me.hState == 1)
                                return data.toString().substr(0,1)+'*****';
                            return data;
                        }
                    },
                    /*{
                        "targets": [-1],
                        "render": function ( data, type, row ) {
                            var str=$.trim(data);
                            if(str){
                                return '<a href="javascript:void(0)" title="'+str+'">'+str.substr(0,2)+(str.length>2?'...':'')+'</a>';
                            }else{
                                return data;
                            }
                        }
                    }*/
                ],
                "columns": [
                    { "data": "stock_name","class": "center","width":"13%" },
                    { "data": "stock_id","class": "center","width":"13%" },
                    { "data": "rise_rate","class": "center","width":"12%" },
                    { "data": "limit_time","class": "center","width":"12%" },
                    { "data": "continue_days","class": "center","width":"12%" },
                    { "data": "is_fall","class": "center","width":"12%" },
                    { "data": "count5","class": "center","width":"12%" },
                    { "data": "memo","class": "center","width":"13%" }
                ],
                "rowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $row=$(nRow);
                    $row.attr("data-id",aData.stock_id);
                    $row.attr("data-name",aData.stock_name);
                },
                "initComplete": function (oSettings, json) {
                    $("#stocks-table tbody tr").css("cursor","pointer");
                    $("#stocks-table tbody tr").on("click",function(e){
                        e.preventDefault();
                        /*var desc = $(this).find('td a').eq(0).attr("title");
                        desc = (desc && desc.length > 0) ? desc : '';
                        $("#stock_table_stock_desc").text(desc);*/
                        $('#stocks-table tbody tr').removeClass('selected');
                        $(this).addClass('selected');
                        if($("#fenshi_btn").hasClass("cur"))
                            $.me.drawChartMin($(this).attr("data-id"));
                        else
                            $.me.drawChartDay($(this).attr("data-id"));
                    });
                    $("#stocks-table tbody tr").on("dblclick",function(e){
                        e.preventDefault();
                        var stockid = $(this).attr("data-id");
                        var prefix='SZ';
                        if(stockid.substr(0,1)=='1')
                            prefix='SH';

                        var allstockids = '';
                        var allData= $('#stocks-table tbody tr');
                        for (var i =0;i< allData.length;i++){
                            var temp =$(allData[i]).attr('data-id');
                            allstockids+= (allstockids=='')?temp:','+temp;
                        }
                        var parr = window.location.href.split('#&echan=');
                        parr = parr[0].split('#&bkid=');
                        var url =parr[0]+ "#&echan=" +stockid+ prefix+"&allstockids="+allstockids;

                        window.location.href = url;
                    });
                    $("#stocks .plateids").unbind('click').click(function (e) {
                        e.preventDefault();
                        var bkid = $(this).attr('bkid');
                        var start = $(this).attr('start');
                        var end = $(this).attr('end');
                        var start_1 = new Date(start.replace(/-/g, "/"));;
                        var end_1 = new Date(end.replace(/-/g, "/"));;
                        if(parseInt((end_1.getTime() - start_1.getTime()) / (1000 * 60 * 60 * 24))>=60) {
                            alert('时间周期超过60个自然日，无法跳转比价星空！');
                        }else{
                            var bgColorStr = '';
                            if($.me.option.title.textStyle.color == '#ebe9e8'){
                                bgColorStr = '&bgColor=B';
                            }else if($.me.option.title.textStyle.color == '#1A2535'){
                                bgColorStr = '&bgColor=W';
                            }
                            var parr = window.location.href.split('#&bkid=');
                            parr = parr[0].split('#&echan=');
                            var url =parr[0]+ "#&bkid=" +bkid+"&start="+start+"&end="+end+bgColorStr;
                            window.location.href = url;
                        }
                    });

                    var len=0;
                    if(json.data)
                        len=json.data.length;
                    $("#stock_num").text("共"+len+"条个股");

                    $("#stocks-table tbody tr").eq(0).trigger('click');
                },
                "paginate": false,
                "scrollY": "150px",
                "bAutoWidth": true, //自动宽度
                //"sorting": [[2, ($.me.curDir=='d'?'asc':'desc')]],
                "sorting": [[3, 'desc']],
                "dom": '<"clear">rt<"clear">'
            } );

            if($.me.myChartMin){
                $.me.myChartMin.dispose();
            }
            $.me.myChartMin = echarts.init($("#fenshi").get(0));
        },
        "drawChartDay":function(stock_id){
            if(!stock_id)
                stock_id=$("#stocks-table tr.selected").data("id");
            if(!stock_id)
                return;
            stock_id=''+stock_id;
            stock_id = ('00000'+stock_id).substr(-6);
            var dateArray=[];
            var priceArray=[];
            var amountArray=[];
            var minprice=1000;
            var maxprice=0;

            var data = {};
            data.stockid = stock_id;
            if(stock_id.substring(0,1)=='6'){
                data.market = 'SH';
            }else{
                data.market = 'SZ';
            }
            data.begin_date = $.me.dateRange[0];
            data.end_date = $.me.dateRange[1];
            data.num = 300;

            var points = [];
            $.ajax({
                async: false,
                type: 'post',
                url: "/webphp/hchan/zxzz/getkline.php",
                data:data,
                dataType: 'json',
                timeout: 5000,
                success: function (result) {
                    for(var i in result.data){
                        var dd=result.data[i];
                        dateArray.push(dd['time']);
                        priceArray.push([dd['open'],dd['close'],dd['high'],dd['low']]);
                        amountArray.push(dd['amount']);
                        minprice=Math.min(minprice,dd['low']);
                        maxprice=Math.max(maxprice,dd['high']);
                        if(dd['time']==$.me.curDate){
                            points.push({
                                symbolRotate: 0,
                                coord: [dd['time'], dd['low']],
                                symbolOffset: [0,7],
                                itemStyle: {
                                    normal: {color: 'red'}
                                }
                            });
                            points.push({
                                symbolRotate: 180,
                                symbolOffset: [0,-7],
                                coord: [dd['time'], dd['high']],
                                itemStyle: {
                                    normal: {color: 'red'}
                                }
                            });
                        }
                    }
                }
            });

            minprice=Math.floor(minprice);
            maxprice=Math.ceil(maxprice);

            var option={
                toolbox: {
                    show : false
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label:{
                            formatter:function(params){
                                return Math.round(params.value*100)/100;
                            }
                        }
                    },
                    backgroundColor: 'rgba(245, 245, 245, 0.8)',
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 10,
                    textStyle: {
                        color: '#000'
                    },
                    position: function (pos, params, el, elRect, size) {
                        var obj = {top: 10};
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                        return obj;
                    },
                    extraCssText: 'width: 170px',
                    formatter: function (params) {
                        var res = params[0].name.substring(0, 4) + '-' + params[0].name.substring(4, 6) + '-' + params[0].name.substring(6, 8) + '<br>';
                        for(var i in params){
                            if(params[i].seriesName=='K线'){
                                res+="开盘: "+Math.round(params[i].data[1]*100)/100 + '<br>';
                                res+="收盘: "+Math.round(params[i].data[2]*100)/100 + '<br>';
                                res+="最高: "+Math.round(params[i].data[3]*100)/100 + '<br>';
                                res+="最低: "+Math.round(params[i].data[4]*100)/100 + '<br>';
                            }
                        }
                        for(var i in params){
                            if(params[i].seriesName=='成交量'){
                                res+=params[i].seriesName+": "+Math.round(params[i].value/1000000)/100 + '千万<br>';
                            }
                        }
                        return res
                    }
                },
                legend: {
                    show: true,
                    padding: 20
                },
                axisPointer: {
                    link: {xAxisIndex: 'all'},
                    label: {
                        backgroundColor: '#777'
                    }
                },
                grid: [{
                    left: '3%',
                    right: '10%',
                    top: '2%',
                    height: '60%'
                },{
                    left: '3%',
                    right: '10%',
                    top: '62%',
                    height: '24%'
                }],
                xAxis: [
                    {
                        type: 'category',
                        data: null,
                        scale: true,
                        boundaryGap : false,
                        splitLine: {show: false},
                        splitLine: {show: false},
                        axisLabel: {show: false},
                        axisTick: {show: false},
                        splitNumber: 10,
                        min: 'dataMin',
                        max: 'dataMax',
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: 'RGB(246,246,246)',
                                width: 1
                            }
                        },
                        axisPointer: {
                            z: 100
                        }
                    },
                    {
                        type: 'category',
                        gridIndex: 1,
                        data: null,
                        scale: true,
                        boundaryGap : false,
                        splitNumber: 10,
                        min: 'dataMin',
                        max: 'dataMax',
                        axisLabel: {
                            color: 'rgb(204, 204, 204)'
                        },
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: 'RGB(246,246,246)',
                                width: 1
                            }
                        },
                        axisPointer: {
                            label: {
                                formatter: function (params) {
                                    return '';
                                },
                                backgroundColor:'transparent'
                            }
                        }
                    }
                ],
                yAxis: [
                    {
                        //scale: true,
                        position: 'right',
                        max: maxprice,
                        min: minprice,
                        /*splitNumber: 5,*/
                        interval:(maxprice-minprice)/5,
                        axisLabel: {
                            color: 'rgb(204, 204, 204)',
                            margin:4,
                            formatter: function (v) {
                                if(v<=minprice)
                                    return '';
                                else
                                    return Math.round(v*100)/100;
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: 'RGB(246,246,246)'
                            }
                        },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: 'RGB(246,246,246)'
                            }
                        }
                    },
                    {
                        scale: true,
                        position: 'right',
                        gridIndex: 1,
                        splitNumber: 2,
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: 'RGB(246,246,246)'
                            }
                        },
                        axisLabel: {
                            show: true,
                            margin:4,
                            formatter: function (v) {
                                return Math.round(v/10000000)+'千万';
                            },
                            color: 'rgb(204, 204, 204)'
                        },
                        splitLine: {show: false},
                        axisTick: {show: false}
                    }
                ],
                series: [
                    {
                        name: 'K线',
                        type: 'candlestick',
                        data: null,
                        markPoint: {
                            label: {
                                normal: {show: false}
                            },
                            symbol: 'triangle',
                            symbolSize: [10, 10],
                            data: []
                        },
                        itemStyle: {
                            normal: {
                                borderColor: null,
                                borderColor0: null
                            }
                        }
                    },
                    {
                        name: '成交量',
                        /*gridIndex: 1,*/
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        type: 'bar',
                        data: null,
                        barMaxWidth:10,
                        itemStyle: {
                            normal: {
                                color: '#7fbe9e'
                            }
                        }
                    }
                ]
            };

            option.series[0].markPoint.data = points;
            option.xAxis[0].data = dateArray;
            option.xAxis[1].data = dateArray;
            option.series[0].data = priceArray;
            option.series[1].data = amountArray;
            //$.me.option.dataZoom[0].startValue = startDate;
            //$.me.option.dataZoom[0].endValue = endDate;
            //$.me.option.dataZoom[1].startValue = startDate;
            //$.me.option.dataZoom[1].endValue = endDate;

            $.me.myChartMin.setOption(option);

            //if(!$.me.stockChart)
            //	$.me.stockChart= echarts.init(document.getElementById('stockbigk'));
            //$.me.stockChart.setOption($.me.option);


        },
        "drawChartMin":function(stock_id){
            if(!stock_id)
                stock_id=$("#stocks-table tr.selected").data("id");
            if(!stock_id)
                return;
            stock_id=''+stock_id;
            stock_id = ('00000'+stock_id).substr(-6);
            var data = {};
            data.stockid = stock_id;
            if(stock_id.substring(0,1)=='6'){
                data.market = 'SH';
            }else{
                data.market = 'SZ';
            }
            data.type = '1';
            data.date = $.me.curDate;

            $.ajax({
                cache: false,
                async: true,
                type: 'post',
                url: "/webphp/hchan/zxzz/getklineoneday.php",
                data:data,
                dataType: 'json',
                timeout: 5000,
                success: function (result) {
                    var resultdata=result.data.mdata;
                    var precloseprice = result.data.preprice;

                    var kdatas=[];
                    var vdatas=[];
                    var curdata=0;
                    var maxvalue=null;
                    var minvalue=null;
                    for(var i=0;i< $.me.minutes.length;i++){
                        var curtime=''+$.me.curDate+$.me.minutes[i];
                        if(resultdata[curtime]){
                            curdata=resultdata[curtime]['close'];
                            vdatas.push(resultdata[curtime]['amount']/10000);
                            if(maxvalue==null){
                                maxvalue=curdata;
                            }else{
                                maxvalue=Math.max(maxvalue,curdata);
                            }
                            if(minvalue==null){
                                minvalue=curdata;
                            }else{
                                minvalue=Math.min(minvalue,curdata);
                            }
                        }else{
                            vdatas.push(0);
                        }
                        kdatas.push(curdata);
                    }

                    var maxdif=Math.max(Math.abs(precloseprice-maxvalue),Math.abs(precloseprice-minvalue));

                    maxvalue=parseFloat(precloseprice)+maxdif;
                    minvalue=parseFloat(precloseprice)-maxdif;

                    var option = {
                        grid: [{
                            left: '3%',
                            right: '15%',
                            top: '5%',
                            height: '60%'
                        },{
                            left: '3%',
                            right: '15%',
                            top: '65%',
                            height: '24%'
                        }],
                        animation: false,
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                var p1,p2,tm;
                                for(var i=0;i<params.length;i++){
                                    if(params[i].seriesName=='指数'){
                                        p1=Math.round(params[i].value*100)/100;
                                    }else{
                                        p2=params[i].value;
                                    }
                                }
                                tm=params[0].name.substring(0,2)+':'+params[0].name.substring(2,4);
                                return  [
                                    '代码: ' + (($.me.hState == 1)?stock_id.toString().substr(0,1)+'*****':stock_id) + '<br/>',
                                    '时间: ' + tm + '<br/>',
                                    '股价: ' + p1 + '<br/>',
                                    '涨跌幅: ' + Math.round((p1-precloseprice)/precloseprice*1000)/10+ '%<br/>',
                                    '成交量: ' + Math.round(p2*100)/100 + '万'
                                ].join('');
                            }
                        },
                        axisPointer: {
                            link: {xAxisIndex: 'all'},
                            label: {
                                backgroundColor: '#777'
                            }
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: $.me.minutes,
                                splitLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        color: 'RGB(246,246,246)',
                                        width: 1
                                    }
                                },
                                axisLabel: {show: false},
                                show: true
                            },{
                                type: 'category',
                                gridIndex: 1,
                                data: $.me.minutes,
                                axisTick: {
                                    show: true
                                },
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        color: 'RGB(246,246,246)',
                                        width: 1
                                    }
                                },
                                axisLabel: {
                                    show: true,
                                    color: 'rgb(204, 204, 204)'
                                }
                            }
                        ],
                        yAxis: [
                            /*{
                                type: 'value',
                                position: 'right',
                                axisLine: {
                                    lineStyle: {
                                        color: 'RGB(246,246,246)'
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                max: maxvalue,
                                min: minvalue,
                                axisLabel: {
                                    show: true,
                                    color: 'rgb(204, 204, 204)',
                                    formatter: function (v) {
                                        return Math.round((v - precloseprice)/precloseprice *1000)/10+'%';
                                    }
                                    //formatter: '{value} %'
                                },
                                axisTick: {
                                    show: false
                                }
                            },*/
                            {
                                type: 'value',
                                position: 'right',
                                axisLine: {
                                    lineStyle: {
                                        color: 'RGB(246,246,246)'
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: 'RGB(246,246,246)'
                                    }
                                },
                                max: maxvalue,
                                min: minvalue,
                                /*splitNumber: 5,*/
                                interval:maxdif/2,
                                axisLabel: {
                                    show: true,
                                    margin:4,
                                    formatter: function (v) {
                                        var rate= Math.round((v - precloseprice)/precloseprice *1000)/10;
                                        if(maxvalue>=100)
                                            var price= Math.round(v*10)/10;
                                        else
                                            var price= Math.round(v*100)/100;
                                        if(v<=minvalue){
                                            return '';
                                        }else{
                                            return price+'('+rate+'%)';
                                        }
                                    },
                                    color: 'rgb(204, 204, 204)'
                                },
                                axisTick: {
                                    show: false
                                }
                            },
                            {
                                gridIndex: 1,
                                position: 'right',
                                splitNumber: 3,
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        color: 'RGB(246,246,246)'
                                    }
                                },
                                axisLabel: {
                                    show: true,
                                    margin:4,
                                    formatter: function (v) {
                                        return Math.round(v)+"万";
                                    },
                                    color: 'rgb(204, 204, 204)'
                                },
                                axisTick: {show: false},
                                splitLine: {show: false}
                            }
                        ],
                        series: [
                            {
                                name: '指数',
                                type: 'line',
                                silent: true,
                                itemStyle: {
                                    normal: {
                                        color: 'gray'
                                    }
                                },
                                symbol: 'none',
                                data: kdatas
                            },{
                                name: 'Volumn',
                                type: 'bar',
                                xAxisIndex: 1,
                                yAxisIndex: 1,
                                data: vdatas
                                /*,
                                itemStyle: {
                                    normal: {
                                        color: function(params) {
                                            var colorList;
                                            if (data.datas[params.dataIndex][1]>data.datas[params.dataIndex][0]) {
                                                colorList = '#ef232a';
                                            } else {
                                                colorList = '#14b143';
                                            }
                                            return colorList;
                                        },
                                    }
                                }*/
                            }
                        ]
                    };
                    $.me.myChartMin.setOption(option);
                    /*var option1 = {
                        grid: [
                            {x: '10%', y: '8%', y2: '5%', x2: '10%', width: '80%', height: '65%'}
                        ],
                        title: {
                            text: '成交额（千万）',
                            textStyle: {
                                color: 'rgb(195,195,195)',
                                fontFamily: 'Arial',
                                fontSize: 12
                            },
                            padding: [5, 0, 0, 70]
                        },
                        animation: false,
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                if (params[0].data == "-")
                                    return "";
                                var res = params[0].name;
                                res += '<br/>成交额 : ' + params[0].data + '万';
                                return res;
                            }
                        },
                        xAxis: [
                            {
                                data: data.date,
                                silent: false,
                                splitLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true,
                                    textStyle: {
                                        color: 'rgb(255, 67, 41)'
                                    }
                                }
                            }
                        ],
                        yAxis: [
                            {
                                splitLine: {
                                    show: false
                                },
                                type: 'value',
                                show: true,
                                min: 0,
                                max: data.volumemax,
                                axisLabel: {
                                    show: true,
                                    textStyle: {
                                        color: 'RGB(179,179,0)'
                                    },
                                    formatter: function (v) {
                                        return v / 1000
                                    }
                                }
                            },
                            {
                                splitLine: {
                                    show: false
                                },
                                type: 'value',
                                show: true,
                                min: 0,
                                max: data.volumemax,
                                axisLabel: {
                                    show: true,
                                    textStyle: {
                                        color: 'RGB(179,179,0)'
                                    },
                                    formatter: function (v) {
                                        return v / 1000
                                    }
                                }
                            }
                        ],
                        series: [
                            {
                                name: '成交额',
                                type: 'bar',
                                silent: true,
                                legendHoverLink: false,
                                itemStyle: {
                                    normal: {color: 'RGB(179,179,0)'}
                                },
                                data: data.volumes,
                                formatter: '{value}'
                            }
                        ]
                    };*/
                }
            });
        },
        "showDetails": function () {
            /*if($.me.plateType == 'index'){
                return;
            }*/
            if($.me.curDate && $.me.curPlate){
                /*$("#stocks .tdate").text($.me.curDate);*/

                if($.me.curPlate){
                    $("#stocks .platename").text($.me.curPlate[1]+"板块涨幅榜");
                    $("#stocks .plateids").attr("bkid",$.me.curPlate[0]) ;
                    var start = '';
                    var end = '';
                    var date = new Date();
                    var year = date.getFullYear();
                    var month = date.getMonth() + 1;
                    var strDate = date.getDate();
                    if (month >= 1 && month <= 9) {
                        month = "0" + month;
                    }
                    if (strDate >= 0 && strDate <= 9) {
                        strDate = "0" + strDate;
                    }
                    var date_now = year +'' + month + '' + strDate;
                    var end_1 = $.me.brushScopeDate[1];
                    if($.me.brushScopeDate[0]&&$.me.brushScopeDate[1]){
                        start = $.me.brushScopeDate[0].substr(0,4)+'-'+$.me.brushScopeDate[0].substr(4,2)+'-'+$.me.brushScopeDate[0].substr(6,2);
                        if($.me.brushScopeDate[1]>= date_now){
                            /*end_1 = (date_now-1).toString();*/
                            end_1 = $.me.kline_array.kline_x[$.me.kline_array.kline_x.length-2];
                            end = end_1.substr(0,4)+'-'+end_1.substr(4,2)+'-'+end_1.substr(6,2);
                        }else{
                            end = $.me.brushScopeDate[1].substr(0,4)+'-'+$.me.brushScopeDate[1].substr(4,2)+'-'+$.me.brushScopeDate[1].substr(6,2);

                        }
                    }
                    $("#stocks .plateids").attr("start",start) ;
                    $("#stocks .plateids").attr("end",end) ;
                    $("#stocks .plateids").attr("start_1",$.me.brushScopeDate[0]) ;
                    $("#stocks .plateids").attr("end_1",end_1) ;
                    $("#stocks .plateids").attr("now",date_now) ;
                }

                $.me.drawStocksTable();
                /*var html="";
                $.ajax({
                    async: false, // 同步调用
                    timeout: 10000, // 超时时间限制为10秒
                    url: "http://120.76.140.236/mytest_stocks.php?filename="+$.me.plateType+"&date="+$.me.curDate+"&id="+$.me.curPlate[0],
                    type: 'post',
                    dataType: 'json',
                    success:function(result){
                        if (result.success) {
                            if(result.data){
                                var stk;
                                for(var i=0;i< result.data.length;i++){
                                    stk=result.data[i].split("##");
                                    html+='<div>'
                                        +'<span class="td red">'+stk[1]+'</span>'
                                        +'<span class="td red">'+stk[0]+'</span>'
                                        +'<span class="td red">'+stk[2]+'</span>'
                                        +'<span class="td red">'+stk[3]+'</span>'
                                        +'<span class="td red">'+stk[4]+'</span>'
                                        +'<span class="td red">'+stk[5]+'</span>'
                                        +'<span class="td red">'+stk[6]+'</span>'
                                        +'</div>';
                                }
                            }
                        } else {
                            $.me.showMsg(result.reason);
                        }

                    },
                    error:function(){

                    }
                });

                $("#stocks .stock-body").html(html);*/

                if(!$("#stocks").hasClass("ui-dialog-content")){
                    $("#stocks").dialog({
                        open: function (event, ui) {
                            $(this).parent().focus();
                        },
                        autoOpen: false,
                        resizable: false,
                        position: [$(".centerdiv").get(0).offsetLeft+100, 100],
                        /*height: 500,
                        width: 1000,*/
                        height: 300,
                        width: 1050,
                        focusInput: false,
                        closeOnEscape: false
                        //	modal: true,
                    });
                }
                $('#stocks').dialog({
                    title:"交易日期："+$.me.curDate
                });
                $("#stocks").dialog("open");
                //		$.me.drawChartMin();
            }
        },
        "addDate":function(a,dadd){
            a = a.valueOf();
            a = a + dadd * 24 * 60 * 60 * 1000;
            return new Date(a);
        },
        "isArray":function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        "inputData":[],
        "inputStockData":[],
        //弹出消息对话框
        "showMsg": function (msg, head) {
            var $div_building = $("#div_showmsg");
            if (!head) head = "提示";
            if ($div_building.length <=0 ) {
                $("body").append("<div id='div_showmsg' style='display: none;'><div class='building building'><div class='building-header'><button type='button' class='login-close'></button><h1 class='headtitle'>" + head + "</h1></div><div class='building-body'><h3 class='showmsg'>" + msg + "</h3></div></div></div>");
            } else {
                $div_building.find("#div_showmsg .showmsg").html(msg);
                $div_building.find("#div_showmsg .headtitle").text(head);
            }
            $.blockUI({
                message: $("#div_showmsg"),
                css: {
                    width: "300px",
                    top: ($(window).height() - $("#div_showmsg").height()) / 2 + 'px',
                    left: ($(window).width() - $("#div_showmsg").width()) / 2 + 'px',
                    cursor: "default",
                    border: 0,
                    "border-radius": "10px"
                },
                overlayCSS: {
                    cursor: "default"
                },
                baseZ: 1000,
                focusInput: false,
                onOverlayClick: $.unblockUI
            });
            $("#div_showmsg .login-close").unbind().click(function () {
                $.unblockUI();
            });
        },
        "plates":[],
        "minutes":[
            '0931',
            '0932',
            '0933',
            '0934',
            '0935',
            '0936',
            '0937',
            '0938',
            '0939',
            '0940',
            '0941',
            '0942',
            '0943',
            '0944',
            '0945',
            '0946',
            '0947',
            '0948',
            '0949',
            '0950',
            '0951',
            '0952',
            '0953',
            '0954',
            '0955',
            '0956',
            '0957',
            '0958',
            '0959',
            '1000',
            '1001',
            '1002',
            '1003',
            '1004',
            '1005',
            '1006',
            '1007',
            '1008',
            '1009',
            '1010',
            '1011',
            '1012',
            '1013',
            '1014',
            '1015',
            '1016',
            '1017',
            '1018',
            '1019',
            '1020',
            '1021',
            '1022',
            '1023',
            '1024',
            '1025',
            '1026',
            '1027',
            '1028',
            '1029',
            '1030',
            '1031',
            '1032',
            '1033',
            '1034',
            '1035',
            '1036',
            '1037',
            '1038',
            '1039',
            '1040',
            '1041',
            '1042',
            '1043',
            '1044',
            '1045',
            '1046',
            '1047',
            '1048',
            '1049',
            '1050',
            '1051',
            '1052',
            '1053',
            '1054',
            '1055',
            '1056',
            '1057',
            '1058',
            '1059',
            '1100',
            '1101',
            '1102',
            '1103',
            '1104',
            '1105',
            '1106',
            '1107',
            '1108',
            '1109',
            '1110',
            '1111',
            '1112',
            '1113',
            '1114',
            '1115',
            '1116',
            '1117',
            '1118',
            '1119',
            '1120',
            '1121',
            '1122',
            '1123',
            '1124',
            '1125',
            '1126',
            '1127',
            '1128',
            '1129',
            '1130',
            '1301',
            '1302',
            '1303',
            '1304',
            '1305',
            '1306',
            '1307',
            '1308',
            '1309',
            '1310',
            '1311',
            '1312',
            '1313',
            '1314',
            '1315',
            '1316',
            '1317',
            '1318',
            '1319',
            '1320',
            '1321',
            '1322',
            '1323',
            '1324',
            '1325',
            '1326',
            '1327',
            '1328',
            '1329',
            '1330',
            '1331',
            '1332',
            '1333',
            '1334',
            '1335',
            '1336',
            '1337',
            '1338',
            '1339',
            '1340',
            '1341',
            '1342',
            '1343',
            '1344',
            '1345',
            '1346',
            '1347',
            '1348',
            '1349',
            '1350',
            '1351',
            '1352',
            '1353',
            '1354',
            '1355',
            '1356',
            '1357',
            '1358',
            '1359',
            '1400',
            '1401',
            '1402',
            '1403',
            '1404',
            '1405',
            '1406',
            '1407',
            '1408',
            '1409',
            '1410',
            '1411',
            '1412',
            '1413',
            '1414',
            '1415',
            '1416',
            '1417',
            '1418',
            '1419',
            '1420',
            '1421',
            '1422',
            '1423',
            '1424',
            '1425',
            '1426',
            '1427',
            '1428',
            '1429',
            '1430',
            '1431',
            '1432',
            '1433',
            '1434',
            '1435',
            '1436',
            '1437',
            '1438',
            '1439',
            '1440',
            '1441',
            '1442',
            '1443',
            '1444',
            '1445',
            '1446',
            '1447',
            '1448',
            '1449',
            '1450',
            '1451',
            '1452',
            '1453',
            '1454',
            '1455',
            '1456',
            '1457',
            '1458',
            '1459',
            '1500'
        ],


        "initDatePicker": function() {
            var date = new Date();
            var $dom = $(".datePicker");
            $dom.datepicker({
                dateFormat: 'yy-mm-dd',
                showWeek: false,
                firstDay: 1,
                maxDate:"0D",
                dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
            });
        },
        "init_date_picker":function(){
            var options = {
                monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                dateFormat: "yy-mm-dd",
                currentText: '今天',
                closeText: '关闭',
                changeMonth: true,
                changeYear: true, //显示年份下拉框
                firstDay: 0,
                showOtherMonths: true, //显示其他月份的日期
                showMonthAfterYear: true, //年份下拉框放在月份下拉框的前面还是后面
                showButtonPanel: true
            };
            //解决datepicker点击今天按钮不能将今天的日期放入输入框的问题
            var date = new Date();
            var today = date.getFullYear() + '-' + $.me.prefixZero(date.getMonth() + 1, 2) + '-' + $.me.prefixZero(date.getDate(), 2);
            $.datepicker._gotoToday = function (id) {
                var target = $(id);
                var inst = this._getInst(target[0]);
                if (this._get(inst, 'gotoCurrent') && inst.currentDay) {
                    inst.selectedDay = inst.currentDay;
                    inst.drawMonth = inst.selectedMonth = inst.currentMonth;
                    inst.drawYear = inst.selectedYear = inst.currentYear;
                }
                else {
                    var date = new Date();
                    inst.selectedDay = date.getDate();
                    inst.drawMonth = inst.selectedMonth = date.getMonth();
                    inst.drawYear = inst.selectedYear = date.getFullYear();
                    // the below two lines are new
                    this._setDateDatepicker(target, date);
                    this._selectDate(id, this._getDateDatepicker(target));
                }
                this._notifyChange(inst);
                this._adjustDate(target);
            };
        },
        "prefixZero": function (str, len) {
            var istr = "" + str;
            var slen = istr.length;
            if (slen > len) {
                $.me.showMsgAlert("参数错误");
            } else {
                for (var i = 0; i < (len - slen); i++) {
                    istr = "0" + istr;
                }
            }
            return istr;
        },
        "showMsgAlert": function (msg) {
            $('#div_showmsg').show();
            $('#div_showmsg p').html(msg);
            $('#div_showmsg .yes').unbind('click').click(function () {
                $('#div_showmsg').hide();
            });
        },
        // 播放轨迹
        "playRangeAnalyse":function(timeout){
            if($.me.playtimer){
                for(var i in $.me.playtimer){
                    clearTimeout($.me.playtimer[i]);
                }
            }
            var range_begin_index   =   parseInt($.me.arrayIndexOf($.me.option.xAxis.data, $.me.brushScopeDate[0]));
            var range_end_index     =   parseInt($.me.arrayIndexOf($.me.option.xAxis.data, $.me.brushScopeDate[1]));

            $.me.myChart.dispatchAction({
                type: 'hideTip',
            });

            //记录播放位置
            if($.me.last_play_idx != null){
                if($.me.last_play_idx <= range_begin_index || $.me.last_play_idx >= range_end_index){
                    $.me.last_play_idx = range_begin_index;
                }
            }else{
                $.me.last_play_idx = range_begin_index;
            }
            var _range_begin_index = parseInt($.me.last_play_idx);

            for(var idx in $.me.option.series.data){
                idx = parseInt(idx);
                if(idx >= _range_begin_index && idx <= range_end_index){
                    (function(new_idx) {
                        $.me.playtimer[idx] = setTimeout(() => {
                            if(new_idx == range_end_index){
                                $(".trace-run").removeClass("play").addClass("stop");
                                $("#k-draw").css({"cursor": "allowed", 'pointer-events': "auto"});
                                $(".select-main").css({'pointer-events': "auto"});
                                $(".play-input-disabled").removeAttr('disabled').removeClass('input-disabled');
                            }
                            $.me.myChart.dispatchAction({
                                type:'downplay',
                                seriesIndex:0,
                                dataIndex:new_idx
                            });
                            $.me.myChart.dispatchAction({
                                type:'highlight',
                                seriesIndex:0,
                                dataIndex:new_idx
                            })
                            $.me.myChart.dispatchAction({
                                type: 'showTip',
                                seriesIndex: 0,
                                dataIndex: new_idx
                            });
                            $.me.last_play_idx = new_idx;
                        }, (new_idx-_range_begin_index)*timeout);
                    }(idx));
                }
            }
        },
        // 选中的区间坐标
        "arrayIndexOf": function (dataArr, datestr) {
            for (var index = 0; index < dataArr.length; index++) {
                if (dataArr[index] == datestr)
                    return index;
            }
        },
        setMyStock: function (oo) {
            window.location.href = "#&mystock=" + $(oo).parent().parent().attr("stockid") + "&sort=" + $(oo).attr("sort");
        }
    };
})(jQuery);

