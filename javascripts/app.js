var newThreshold = function(options){
	option = {
		add: options.add  || '#newThreshold',
		body:options.body || '#table_body',
		timebar:options.timebar || 'footer'
	};
	var colorArray = ['purple', 'lightblue', 'green', 'blue', 'magenta', 'brightgreen'];
	var buffer = [];
	var flag = 0;
	var _this;
	$(document).keydown(function(e){//按下esc退出编辑模式
		if(e.keyCode == 27){
			console.log(_this);
			_this.__proto__.close;
		}
	});
	$(document).mousedown(function(e){//点击body退出编辑模式
		if(e.target.localName == 'body'){
			_this.__proto__.close;
		}
	})
	function NumCheck(num){
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
	function TimeIndex(time){
		var index = 0
		var _time = 0;
		while(time >= 1){
			index += 4;
			time--;
		}
		_time = Math.floor(time * 100);
		console.log('_time:'+ _time);
		if(_time < 100){
			switch(_time){
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
		console.log('_index:'+ index);
		return index;
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
	    	_this = this;
	        return this;
	    },
	    // sortRender: function() {
	    // 	var _this = this;
	    // 	Thresholds.models.map(function(item){
	    // 		_this.$el.html(_this.template(item.toJSON()));
	    // 		this.$('.view').addClass(item.attributes.color);
	    // 	});
	    // 	// this.$el.html(this.template(this.model.toJSON()));
	    // },
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
	    	else if(flag !== 1 && value == 'Any Time'){
	    		flag = 1;
	    	}
	    	else if(flag == 1 && value == 'Any Time'){
	    		alert('Any Time is Only');
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
	    	this.$('.view').addClass("editing");
	        // this.$('.errorbar').removeClass('hidden');
	        // this.$('.criticalbar').removeClass('hidden');
	       	this.$('.errorbar').slideDown('slow');
	        this.$('.criticalbar').slideDown('slow');
	        this.$('.start').focus();
	    },
	    editing: function() {
	    	this.$('.view').addClass("editing");
	    	this.$('.warnbar').slideDown('slow');
	        this.$('.errorbar').slideDown('slow');
	        this.$('.criticalbar').slideDown('slow');
	    },
	    // 关闭编辑模式，并把修改内容同步到Model和界面
	    close: function() {
	    	var warnValue = this.$('.warnthres').val();
	    	var errorvalue = this.$('.errorthres').val();
	    	var criticalvalue = this.$('.criticalthres').val();
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
	        if(Thresholds.models.length >= colorArray.length){

	        }
	        else{
	        	$('.color').removeClass(this.model.attributes.color);
	        }
	        //改变colorbar中的颜色显示,首先移除当前颜色，保证修改时颜色条变化。
	        if(this.model.attributes.fromTime !== 'Any Time'){
	        	var fromTime = this.model.attributes.fromTime.replace(':', '.'); 
		        var endTime = this.model.attributes.endTime.replace(':', '.');
				var endIndex = TimeIndex(endTime);//4+4+2
				var fromIndex = TimeIndex(fromTime);//4
				console.log('fromIndex：'+fromIndex,'endIndex：'+endIndex);
				var index = endIndex - fromIndex;
				if(index < 0){
					endIndex = endIndex + 96;
				}
		        for(var i = fromIndex ; i < endIndex ; i++){
		        	$('.color').eq(i).addClass(this.model.attributes.color);
		        }
	        }
	        else{
	        	$('.color').addClass(this.model.attributes.color);
	        }
	        //输出编辑后的字符串
	        var _self = this.model.attributes;
	        if(this.model.attributes.fromTime !== 'Any Time'){
	        	console.log('('+_self.fromTime+" "+ _self.endTime+')'+" " + _self.compareValue +" "+ _self.warnValue+" "+  _self.errorValue +" "+ _self.criticalValue);
	        }
	        else{
	        	console.log("("+_selfromTime+")"+" "+ _self.compareValue +" "+ _self.warnValue+" "+  _self.errorValue +" "+ _self.criticalValue);
	        }
	        //排序
	        Thresholds.comparator;//model顺序已经改变
	    },
	    // 移除对应条目，以及对应的数据对象
	    clear: function() {
	        this.model.destroy();
	        $('.color').removeClass(this.model.attributes.color);
	    }
	});
	//以及任务的添加。主要是整体上的一个控制
	var AppView = Backbone.View.extend({

	    //绑定页面上主要的DOM节点
	    el: $("#Threshold-App"),

	    // 在底部显示的统计数据模板
	    statsTemplate: _.template($('#stats-template').html()),

	    // 绑定dom节点上的事件
	    events: {
	        "click #newThreshold":  "createThreshold",
	    },

	    //在初始化过程中，绑定事件到Todos上，
	    //当任务列表改变时会触发对应的事件。
	    //最后从localStorage中fetch数据到Thresholds中。
	    initialize: function() {
	        this.input = this.$(".allTime");
	        this.listenTo(Thresholds, 'add', this.addOne);
	        this.listenTo(Thresholds, 'reset', this.addAll);
	        // this.listenTo(Thresholds, 'all', this.render);
	        this.footer = this.$(option.timebar);
	       	this.footer.html(this.statsTemplate());
	        this.footer.show();
			Thresholds.fetch({  
			    success: function(collection, resp) {  
			        // 同步成功后在控制台输出集合中的模型列表  
			        console.log(collection.models);  
			    }  
			}); 
	    },

	    // 更改当前任务列表的状态
	    render: function() {

	    },
	    // 添加一个任务
	    addOne: function(Threshold) {
	        var view = new ThresholdView({model: Threshold});
	        this.$(option.body).append(view.render().el);
        	this.footer.show();
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