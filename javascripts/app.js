var newThreshold = function(options){
	option = {
		maincontainer: options.maincontainer || '#app',
		add: options.add  || '#newThreshold',
		body:options.body || '#table_body',
		timebar:options.timebar || 'footer'
	};
	var colorArray = ['purple', 'lightblue', 'green', 'blue', 'magenta', 'brightgreen'];
	var buffer = [];
	$(options.body).addClass('middle');
	$(options.maincontainer).addClass('relative');
	$(document).keydown(function(e){//按下esc退出编辑模式
		if(e.keyCode == 27){
			$('.view').removeClass('editing');
			$('select').blur();
			$('input').blur();
		}
	});
	$(document).mousedown(function(e){//点击body退出编辑模式
		if(e.target.localName == 'body'){
			$('.view').removeClass('editing');
			$('select').blur();
			$('input').blur();
		}
	})
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
		console.log('_time:'+ _time);
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
        	var _Self = that;
        	colorArray.map(function(item){ //保证只显示先来的颜色
        		if($('.color').eq(i).hasClass('expand')) return
        		else{
        			$('.color').eq(i).addClass(_Self.get('color'));
        			$('.color').eq(i).addClass('expand');
        		}
        	})
        }
	};
	var Threshold = Backbone.Model.extend({
    	// 设置默认的属性
   		defaults: function(){
   			return {
   				color: Thresholds.ranColor(),
	   			fromTime:'Any Time',
	        	endTime:'00:00',
	        	valueStatus:'value',
	        	compareValue:'=',
	        	warnValue:'',
	        	errorValue:'',
	        	criticalValue:'',
	        	sortTime: ''
   			};
   		}
    	// 设置任务完成状态
    	// toggle: function() {
     //    	this.save({done: !this.get("done")});
   		// }
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
	    	"dblclick .view"     : "edit",
	    	"focus .allTime"     : "editing",
	    	"focus .fromTime"	 : "editing",
	    	"focus .endTime"	 : "editing",
	    	"focus .valueStatus" : "editing",
	    	"focus .compare"	 : "editing",
	    	"focus .warnthres"    : "editing",
	        "focus .errorthres"   : "editing",
	        "focus .criticalthres" : "editing",
	        "blur  .allTime"       :"editFromTime",
	        "blur .fromTime"      : "editFromTime",
	        "blur .endTime"      : "editEndTime",
	        "blur .valueStatus"  : "editStatus",
	        "blur .compare"      : "compare",
	       	"blur .warnthres"    : "warnValue",
	        "blur .errorthres"   : "errorValue",
	        "blur .criticalthres"  : "criticalValue",
	        "click .save"      : "close",
	       	"click .delete" : "clear"
	    },

	    //在初始化时设置对model的change事件的监听
	    //设置对model的destroy的监听，保证页面数据和model数据一致
	    initialize: function() {
	        //这个remove是view的中的方法，用来清除页面中的dom
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
	    	if(value !== 'Any Time'){
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
	    	if(value !== 'Any Time'){
	    		this.model.save({fromTime: value});
	    		//sortTime用来当fromtime改变时进行排序的依据。
	    		this.model.save({sortTime: value.replace(':','.')*100})
	    		this.$('.allTime').addClass('fromTime');
	    		this.$('.allTime').removeClass('allTime');
	    		this.$('.endTime').removeClass('hidden');
	    		this.$('.start')[0].value = value;
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
	    	this.model.save({warnValue: value});
	    },
	   	errorValue: function(){
	    	var value = this.$('.errorthres').val();
	    	this.model.save({errorValue: value});
	    },
	    criticalValue: function(){
	    	var value = this.$('.criticalthres').val();
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
	    	if($('.allTime').length > 1){ //警告any Time只能有一个
	    		alert('Any Time only one');
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
	        //当前Model数量小于颜色数组数量，当前首先移除expand和color
	        if(Thresholds.models.length <= colorArray.length){
	        	$('.color').siblings("."+this.model.get('color')).removeClass('expand');
	        	$('.color').removeClass(this.model.attributes.color);
	        }
	        //改变colorbar中的颜色显示,首先移除当前颜色，保证修改时颜色条变化。
	        if(this.model.attributes.fromTime !== 'Any Time'){
	        	AddColor(this.model);
	        }
	        else{
	        	LoopAddColor(this.model, 0, 96);
	        }
	        //输出编辑后的字符串
	        var _self = this.model.attributes;
	        if(this.model.attributes.fromTime !== 'Any Time'){
	        	console.log('('+_self.fromTime+" "+ _self.endTime+')'+" " + _self.compareValue +" "+ _self.warnValue+" "+  _self.errorValue +" "+ _self.criticalValue);
	        }
	        else{
	        	console.log("()"+" "+ _self.compareValue +" "+ _self.warnValue+" "+  _self.errorValue +" "+ _self.criticalValue);
	        }
	    },
	    // 移除对应条目，以及对应的数据对象
	    clear: function() {
	        this.model.destroy();
	        console.log($('.color').find(this.model.get('color')));
	       	$('.color').siblings("."+this.model.get('color')).removeClass('expand');//expand没有移除导致bug
	        $('.color').removeClass(this.model.attributes.color);
	        if(Thresholds.length == 0){
	        	$('.color').removeClass('expand');
	        }
	        else{//删除完AnyTime后，所有颜色被移除，需要改变成再次给颜色条赋值
	        	Thresholds.models.map(function(item){
	        		AddColor(item);
	        	})
	        }
	    }
	});
	function AddColor(item){//model
		var _this = item;
		console.log(_this);
		var timeArray = ChangeTime(_this.get('fromTime'), _this.get('endTime'));
		var fromIndex = timeArray[0];
		var endIndex = timeArray[1];
		var index = endIndex - fromIndex;
		if(index == 0){
			LoopAddColor(_this, 0, 96);
			_this.$('.fromTime').addClass('allTime');
			_this.$('.fromTime').removeClass('fromTime');
			console.log($('.allTime'));
			$('.allTime')[0].value = 'Any Time';
			_this.$('.endTime').addClass('hidden');
			_this.model.attributes.fromTime == 'Any Time';
			return
		}
		console.log('fromIndex：'+fromIndex,'endIndex：'+endIndex);
		if(index < 0){//判断是否跨天
			var firstDayIndex = 96 - fromIndex;//eg:23:00 - 1:30 4
			var secondDayIndex = endIndex;
			LoopAddColor(_this, fromIndex, 97);
	        LoopAddColor(_this, 0, secondDayIndex);
		}
		else{
			LoopAddColor(_this, fromIndex, endIndex);
		}
	}
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
			        // 同步成功后在控制台输出集合中的模型列表  
			        console.log(collection.models);  
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