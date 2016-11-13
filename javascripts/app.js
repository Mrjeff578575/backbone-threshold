var newThreshold = function(options){
	var option = {
		maincontainer: options.maincontainer || '#app',
		body:options.body || '#table_body',
		timebar:options.timebar || 'footer',
		input: options.input || '#thresInput',
		add: options.add || '.Textadd'
	};
	var colorArray = ['purple', 'lightblue', 'green', 'blue', 'magenta', 'brightgreen'];
	var buffer = [];
	var outputArray = [];
	var numRegx = /^\d+$/;
	$(option.body).addClass('middle');
	$(option.maincontainer).addClass('relative');
	$(document).keydown(function(e){//按下esc退出编辑模式
		if(e.keyCode == 27){
			$('.view').removeClass('editing');
			$('.view').removeClass('active');
			$('select:focus').blur();
			$('input:focus').blur();
		}
	});
	$(document).mousedown(function(e){//点击body退出编辑模式
		if(e.target.localName == 'body'){
			$('.view').removeClass('editing');
			$('.view').removeClass('active');
			$('select:focus').blur();
			$('input:focus').blur();
		}
	})
	//获取输入框信息，并转换
	$(option.add).click(function(){
		var input;
		input = $(option.input).val();
		if(input == ''){
			alert('请输入之后再点击添加');
			return;
		}
		$(option.input)[0].value = '';
		var timeRegx = /^\(.*\)/;
		var compareRegx = /[>=<]/;
		var time_Regx = /\d{2}:\d{2}/;
		if(!timeRegx.test(input)){
			alert('时间输入格式不正确');
			return;
		}
		if(input.match(timeRegx)[0].replace(/[()]/gi, '') !== '' && input.match(timeRegx)[0].replace(/[()]/gi, '').length <= 10){
			alert('时间输入格式不正确');
			return;			
		}
		if(!compareRegx.test(input)){
			alert('操作符输入格式不正确');
			return;
		}
		//当前只能准确处理00 15 30 45这种时间，其余的只能近似处理
		var fromTime = input.match(timeRegx)[0].replace(/[()]/gi, '').substr(0, 5);
		var endTime = input.match(timeRegx)[0].replace(/[()]/gi, '').substr(6, 10);
		if(!time_Regx.test(fromTime) || !time_Regx.test(endTime)){
			alert('开始或结束时间输入不正确');
		}
		var compare = input.match(compareRegx)[0];
		var index = input.indexOf(compare);
		var thres = input.substring(index+2);
		if(!numRegx.test(thres.replace(/ /gi,'')) && thres !== ''){
	    	alert('阈值必须是数字');
	    	return;
	    };
		//添加之后必须点save才能保存
		if(fromTime == endTime || fromTime == ''){
			fromTime = 'all day';
			endTime = '';
		}
		var result = [];
		sub(0, thres, result);
		Thresholds.create({
				fromTime:fromTime,
	        	endTime:endTime,
	        	compareValue:compare,
	        	warnValue:result[0] || '',
	        	errorValue:result[1] || '',
	        	criticalValue:result[2] || ''
		});
	});
	//讲thres部分剥离并推入结果数组
	function sub(index, str, result){ //11 22 => 11 => 11 22 => 22
		if(result.length >= 3) return result;
		var string = str.slice(index);
		var blankIndex = string.indexOf(' ');
		if(blankIndex == -1){
			result.push(string);
			return;
		}
		else{
			result.push(string.substr(0, blankIndex));
		}
		sub(blankIndex+1, string, result);
	}
	function NumCheck(num){//随机颜色check
		if(buffer.indexOf(num) == -1){
    		buffer.push(num);
    		return buffer[buffer.indexOf(num)];
    	}
    	else{
    		var newNum = Math.floor(Math.random() * colorArray.length);
    		if(buffer.length == colorArray.length){
    			buffer = [];
    		};
    		return NumCheck(newNum);
    	}
	};
	function ChangeTime(_fromTime, _endTime){
	    var fromTime = _fromTime.replace(':', '.'); 
        var endTime = _endTime.replace(':', '.');
		var endIndex = TimeIndex(endTime);
		var fromIndex = TimeIndex(fromTime);
		return [fromIndex, endIndex];
	}
	function TimeIndex(time){//计算时间格子
		var index = 0
		var _time = 0;
		while(time >= 1){
			index += 4;
			time--;
		}
		_time = Math.floor(time * 100);
		if(_time < 100){
			switch(_time){//进行数据修正
				case 0:
					break;
				case 14:
				case 15:
				case 16:
					index = index + 1;
					break;
				case 29:
				case 30:
				case 31:
					index = index + 2;
					break;
				case 44:
				case 45:
				case 46:
					index = index + 3;
					break;
			}
		}
		return index;
	};
	//循环加上颜色，并检测是否会覆盖 参数依次：this值，起始值，结束值
	function LoopAddColor(that, from, end){
		for(var i = from ; i < end ; i++){
			var flag = CheckColor($('.color').eq(i));
			if(flag){ //如果没颜色并且不是allday就添加颜色和expand
				$('.color').eq(i).addClass(that.get('color'));
				if(that.get('fromTime') !== 'all day' && that.get('fromTime') !== that.get('endTime')){
					$('.color').eq(i).addClass('expand'); 
				}
			}
        }
	};
	//传入dom元素，判断这个dom元素上面是否有除了灰色以外的其他颜色
	function CheckColor(dom) {
		var num = 0;//用来判断是否颜色判断完成
		colorArray.map(function(item){
			dom.hasClass(item) ? num = -1 : num += 1
		})
		return num == colorArray.length ? true : false
	}
	//传入Model。然后为颜色条附上相应的颜色
	function AddColor(item){//model
		var _this = item;
		var timeArray = ChangeTime(_this.get('fromTime'), _this.get('endTime'));
		var fromIndex = timeArray[0];
		var endIndex = timeArray[1];
		var index = endIndex - fromIndex;
		if(index == 0){
			LoopAddColor(_this, 0, 96);
			// try{ //必须是backboneView才有效
			// 	_this.$('.fromTime').addClass('allTime');
			// 	_this.$('.fromTime').removeClass('fromTime');
			// 	$('.allTime')[0].value = 'all day';	
			// 	_this.$('.endTime').addClass('hidden');
			// 	_this.model.attributes.fromTime == 'all day';
			// }
			// catch(e){
			// 	console.log(e);
			// }
			return
		}
		if(index < 0){//判断是否跨天
			var firstDayIndex = 96 - fromIndex;//eg:23:00 - 1:30 4
			var secondDayIndex = endIndex;
			LoopAddColor(_this, fromIndex, 97);
	        LoopAddColor(_this, 0, secondDayIndex);
		}
		else{
			LoopAddColor(_this, fromIndex, endIndex);
		}
	};
	function OutPut(that, flag){//model,修改数据的时候需要移除当前model相关
		var _self = that.attributes;
		var output;
		var index;
		var id = that.id;
		var isRepeat = false;
		var separator = '';
		if(_self.fromTime !== 'all day'){
			output = '('+_self.fromTime+" "+ _self.endTime+')'+" " + _self.compareValue +" "+ _self.warnValue+" "+  _self.errorValue +" "+ _self.criticalValue;
		}
		else{
			output = "("+_self.fromTime+")"+" "+ _self.compareValue +" "+ _self.warnValue+" "+  _self.errorValue +" "+ _self.criticalValue;
		}
		if(flag){//添加
			//如果当前要保存的id已经存在就先删除掉当前id的output
			outputArray.map(function(item){
				if(item.id == id && item.output !== output){//id相同并且输出不同（正在编辑）
					isRepeat = true;
					item.output = output;
				}
				else if(item.id == id){//id相同输出相同(再次保存)
					isRepeat = true;
				}
			})
			if(!isRepeat){
				outputArray.push({output:output, id: id});
			}
		}
		else{
			outputArray.map(function(item){
				if(item.id == id){//找到需要删除的元素
					index = outputArray.indexOf(item);
					return;
				}
			})
			outputArray.splice(index, 1);
		}
		$('.outputBar')[0].innerHTML = '';
		if(outputArray.length > 1){
			separator = ',';
		}
		outputArray.map(function(item){
			$('.outputBar')[0].innerHTML +=  item.output +' '+separator+' ';
		})
	};
	var Threshold = Backbone.Model.extend({
    	// 设置默认的属性
   		defaults: function(){
   			return {
   				color: Thresholds.ranColor(),
	   			fromTime:'all day',
	        	endTime:'00:00',
	        	valueStatus:'value',
	        	compareValue:'=',
	        	warnValue:'',
	        	errorValue:'',
	        	criticalValue:'',
	        	sortTime: '',
	        	order:Thresholds.nextOrder()//加入order判断先来后到
   			};
   		}
	});

	var ThresholdList = Backbone.Collection.extend({
	    model: Threshold,
	    //存储到浏览器，以todos-backbone命名的空间中
	    //此函数为Backbone插件提供
	    //地址：https://github.com/jeromegn/Backbone.localStorage
	    localStorage: new Backbone.LocalStorage("Threshold-backbone"),
	    //排序
	    order: function() {
		    if (!this.length) return 1;
	     	 return this.last().get('order') + 1;
	    },
	    //获取随机颜色
	    ranColor: function() {
	    	var Num = Math.floor(Math.random() * colorArray.length)
	    	var num = NumCheck(Num);
	    	return colorArray[num];
	    },
	    nextOrder: function() {
	      if (!this.length) return 1;
	      return this.last().get('order') + 1;
	    },
	    //Backbone内置属性，指明collection的排序规则。
	    comparator: 'sortTime'
	    // comparator: (this.fromTime=="all time") ? 'order' : 'sortTime'
	});
	// 首先是创建一个全局的Todo的collection对象

	var Thresholds = new ThresholdList;

	// 先来看ThresholdView，作用是控制任务列表
	var ThresholdView = Backbone.View.extend({

	    //下面这个标签的作用是，把template模板中获取到的html代码放到这标签中。
	    tagName:  "div",

	    // 获取一个任务条目的模板,缓存到这个属性上。
	    template: _.template($('#item-template').html()),

	    // 为每一个任务条目绑定事件
	    events: {
	    	"dblclick .view"       : "edit",
	    	"focus .allTime"       : "editing",
	    	"focus .fromTime"	   : "editing",
	    	"focus .endTime"	   : "editing",
	    	"focus .valueStatus"   : "editing",
	    	"focus .compare"	   : "editing",
	    	"focus .warnthres"     : "editing",
	        "focus .errorthres"    : "editing",
	        "focus .criticalthres" : "editing",
	        "blur .allTime"        : "editFromTime",
	        "blur .fromTime"       : "editFromTime",
	        "blur .endTime"        : "editEndTime",
	        "blur .valueStatus"    : "editStatus",
	        "blur .compare"        : "compare",
	       	"blur .warnthres"      : "warnValue",
	        "blur .errorthres"     : "errorValue",
	        "blur .criticalthres"  : "criticalValue",
	        "click .save"          : "close",
	       	"click .delete"        : "clear"
	    },

	    //在初始化时设置对model的change事件的监听
	    //设置对model的destroy的监听，保证页面数据和model数据一致
	    initialize: function() {
	        //这个remove是view的中的方法，用来清除页面中的dom
	        // this.listenTo(this.model,'change:fromTime', this.render)
	        this.listenTo(this.model, 'destroy', this.remove);
	    },

	    // 渲染随机颜色，然后返回对自己的引用this
	    render: function() {
	        this.$el.html(this.template(this.model.toJSON()));
	        this.$('.view').addClass(this.model.attributes.color);
	        if(this.$('.allTime').val() !== undefined){
	    		var value = this.$('.allTime').val();
	    	}
	    	else{
	    		var value = this.$('.fromTime').val();
	    	}
	    	if(value !== 'all day'){
	    		this.model.save({fromTime: value});
	    		//sortTime用来当fromtime改变时进行排序的依据。
	    		this.model.save({sortTime: value.replace(':','.')*100})
	    		this.$('.allTime').addClass('fromTime');
	    		this.$('.allTime').removeClass('allTime');
	    		this.$('.endTime').removeClass('hidden');
	    		this.$('.start')[0].value = value;
	    	}
	        return this;
	    },
	    editFromTime: function(){
	    	if(this.$('.allTime').val() !== undefined){
	    		var value = this.$('.allTime').val();
	    	}
	    	else{
	    		var value = this.$('.fromTime').val();
	    	}
	    	if(value !== 'all day'){
	    		this.model.save({fromTime: value});
	    		//sortTime用来当fromtime改变时进行排序的依据。
	    		this.model.save({sortTime: value.replace(':','.')*100})
	    		this.$('.allTime').addClass('fromTime');
	    		this.$('.allTime').removeClass('allTime');
	    		this.$('.endTime').removeClass('hidden');
	    		this.$('.start')[0].value = value;
	    	}
	    	else{
	    		if(this.$('.allTime').val() == undefined){
	    			this.model.save({fromTime: value});
		    		this.model.save({sortTime: 0 });//all day排在最前面
		    		this.$('.fromTime').addClass('allTime');
		    		this.$('.allTime').removeClass('fromTime');
		    		this.$('.endTime').addClass('hidden');
		    		this.$('.start')[0].value = value;
	    		}
	    	}
	    },
	    editEndTime: function(){
	    	var value = this.$('.endTime').val();
	    	this.model.save({endTime: value});
	    },
	    editStatus: function(){
	    	var value = this.$('.valueStatus').val();
	    	this.model.save({valueStatus: value});
	    },
	    compare: function(){
	    	var value = this.$('.compare').val();
	    	this.model.save({compareValue: value});
	    },
	    warnValue: function(){
	    	var value = this.$('.warnthres').val();
	    	if(!numRegx.test(value) && value !== ''){
	    		alert('输入数值必须是数字');
	    		return;
	    	};
	    	this.model.save({warnValue: value});
	    },
	   	errorValue: function(){
	    	var value = this.$('.errorthres').val();
	    	if(!numRegx.test(value) && value !== ''){
	    		alert('输入数值必须是数字');
	    		return;
	    	};
	    	this.model.save({errorValue: value});
	    },
	    criticalValue: function(){
	    	var value = this.$('.criticalthres').val();
	    	if(!numRegx.test(value) && value !== ''){
	    		alert('输入数值必须是数字');
	    		return;
	    	};
	    	this.model.save({criticalValue: value});
	    },
	    // 修改任务条目的样式
	    edit: function() {
	    	$('.view').removeClass('active');
	    	this.$('.view').addClass("editing");
	    	this.$('.view').addClass("active");
	       	this.$('.errorbar').slideDown('slow');
	        this.$('.criticalbar').slideDown('slow');
	        this.$('.start').focus();
	    },
	    editing: function() {
	    	$('.view').removeClass('active');
	    	this.$('.view').addClass("editing");
	    	this.$('.view').addClass("active");
	    	this.$('.warnbar').slideDown('slow');
	        this.$('.errorbar').slideDown('slow');
	        this.$('.criticalbar').slideDown('slow');

	    },
	    // 关闭编辑模式，并把修改内容同步到Model和界面
	    close: function() {
	    	var warnValue = this.$('.warnthres').val();
	    	var errorvalue = this.$('.errorthres').val();
	    	var criticalvalue = this.$('.criticalthres').val();
	    	if($('.allTime').length > 1){ //保存时检查,警告any Time只能有一个
	    		alert('all day is only');
	    		return
	    	}
	    	//判断是否隐藏error和critical
	    	// errorvalue == "" ? this.$('.errorbar').addClass('hidden') : this.$('.errorbar').removeClass('hidden');
	    	// criticalvalue == "" ? this.$('.criticalbar').addClass('hidden') : this.$('.criticalbar').removeClass('hidden');
			errorvalue == "" ? this.$('.errorbar').slideUp("slow") : this.$('.errorbar').slideDown('slow');
 			criticalvalue == "" ? this.$('.criticalbar').slideUp("slow") : this.$('.criticalbar').slideDown('slow');
	    	if((errorvalue !== '' || criticalvalue !== '') && warnValue == ''){
	    		this.$('.warnbar').slideUp("slow");
	    		// this.$('.warnbar').addClass('hidden');
	    	}
	    	else{
	    		this.$('.warnbar').slideDown("slow");
	    		// this.$('.warnbar').removeClass('hidden');
	    	}
	        this.$('.view').removeClass("editing");
	        this.$('.view').removeClass("active");
	        //这里会移除相同颜色
	        //当前Model数量小于颜色数组数量，当前首先移除expand和color
        	$('.color').siblings("."+this.model.get('color')).removeClass('expand');
        	$('.color').removeClass(this.model.attributes.color);
        	//不等于all day且开始和结束时间不同
	        if(this.model.get('fromTime') !== 'all day' && this.model.get('fromTime') !== this.model.get('endTime')){
	        	AddColor(this.model);
	        }
	        //等于all day
	        else if(this.model.get('fromTime') == 'all day'){
	        	LoopAddColor(this.model, 0, 96);
	        }
	        //不等于all day 并且开始和结束相同，判定为all day
	        else{
	        	console.log(this);
	        	LoopAddColor(this.model, 0, 96);
	        	this.model.save({fromTime: 'all day'});
	        	this.$('.fromTime').addClass('allTime');
				this.$('.fromTime').removeClass('fromTime');
				$('.allTime')[0].value = 'all day';	
				this.$('.endTime').addClass('hidden');
				this.model.attributes.fromTime == 'all day';
	        }
	        //再次渲染相同颜色的model，保证移除的时候不移除相同
	        var _this = this;
	        Thresholds.models.map(function(item){
	        	if(item.get('color') == _this.model.get('color')){
	        		AddColor(item);
	        	}
	        })
	        //输出编辑后的字符串,传入标志位(true表示添加,false表示删除)
	        OutPut(this.model, true);
	    },
	    // 移除对应条目，以及对应的数据对象
	    clear: function() {
	        this.model.destroy();
	        OutPut(this.model, false);      
	        var color = this.model.get('color');
	        var index = colorArray.indexOf(color);//删除Buffer当前当前颜色索代表的数字
	        index = buffer.indexOf(index);
	        buffer.splice(index, 1);
	       	$('.color').siblings("."+color).removeClass('expand');
	        $('.color').removeClass(color);
	        if(Thresholds.length == 0){
	        	$('.color').removeClass('expand');
	        }
	        else{
	        //删除完AnyTime后，所有颜色被移除，需要改变成再次给颜色条赋值
	        //因为model已经重新排序而视图没有重新排序，fetch的时候，会出现先设置的颜色可能被后设置的颜色覆盖。
	        //解决方案：1.关闭Model排序 2.将排序体现在视图上
	        	Thresholds.models.map(function(item){ 
	        		AddColor(item);
	        	})
	        }
	    }
	});
	//以及任务的添加。主要是整体上的一个控制
	var AppView = Backbone.View.extend({

	    //绑定页面上主要的DOM节点
	    el: $(option.maincontainer),

	    // 在底部显示的统计数据模板
	    statsTemplate: _.template($('#stats-template').html()),

	    // 绑定dom节点上的事件
	    events: {
	        "click #newThreshold":  "createThreshold",
	    },

	    //在初始化过程中，绑定事件到Thresholds上，
	    //当任务列表改变时会触发对应的事件。
	    //最后从localStorage中fetch数据到Thresholds中。
	    initialize: function() {
	        this.input = this.$(".allTime");
	        this.listenTo(Thresholds, 'add', this.addOne);
	        this.listenTo(Thresholds, 'reset', this.addAll);
	        this.listenTo(Thresholds, 'all', this.render);
	        this.listenTo(Thresholds, 'change:sortTime', this.resort);
	        this.footer = $(option.timebar);
	       	this.footer.html(this.statsTemplate());
			Thresholds.fetch({  
			    success: function(collection, resp) {
			    	buffer = [];//避免再次调用ranColor产生随机数干扰  
			    	var length = 0;
			    	if($('.allTime').length > 1){ //保存时检查,警告any Time只能有一个
				    	alert('all day only one');
				    	return;
				    }
			        // 同步成功后渲染颜色,并输出值
			        collection.models.map(function(item){
			        	var index = colorArray.indexOf(item.get('color'));
			        	if(item.get('fromTime') == item.get('endTime')){
			        		item.save({fromTime: 'all day'});
			        	}
			        	buffer.push(index);
			        	if(buffer.length == 6){
			        		buffer = [];
			        	}
			        	OutPut(item, true);  
			        	//如果是all day则不进行常规的添加颜色
			        	if(item.get('fromTime') == 'all day'){
			        		LoopAddColor(item, 0, 96);
			        	}
			        	AddColor(item);
			        })
			    }  
			}); 
	    },

	    // 更改当前任务列表的状态
	    render: function() {
	    	var length = Thresholds.length;
	    	if(length){
	    		$('.timebar').show();
	    	}
	    	else{
	    		$('.timebar').hide();
	    	}
	    },
	    resort: function(that) {
	    	//排序
	        Thresholds.comparator;//model顺序已经改变，怎么渲染到视图上
	    },
	    // 添加一个任务
	    addOne: function(Threshold) {
	        var view = new ThresholdView({model: Threshold});
	        $(option.body).append(view.render().el);
	    },

	    // 把Thresholds中的所有数据渲染到页面,页面加载的时候用到
	    addAll: function() {
	        Thresholds.each(this.addOne, this);
	    },
	    //创建一个任务的方法，使用backbone.collection的create方法。
	    //将数据保存到localStorage,这是一个html5的js库。
	    //需要浏览器支持html5才能用。
	    createThreshold: function() {
	        //创建一个对象之后会在backbone中动态调用Thresholds的add方法
	        //该方法已绑定addOne。
	        Thresholds.create();
	    }
	});
	var app = new AppView;
};