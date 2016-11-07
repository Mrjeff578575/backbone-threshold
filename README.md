# backbone-threshold
## 使用说明
要使用这个组件，你首先的复制这两段模板到你的HTML文件的body中。然后引入这个组件的JS与CSS
接下来你需要创建一个这个组件的实例。你可以定义组件添加条所在的位置，组件主体所在的位置和组件时间栏所在的位置。
就像这样：
``
var threshold = new newThreshold({
			add:'#newThreshold',//param:string,such as '#xxx','.xxx','div'
			body:'#table_body',//param:string,such as '#xxx','.xxx','div'
			timebar:'#Threshold-count'//param:string,such as '#xxx','.xxx','div'
		})
``
然后就可以愉悦的使用啦。