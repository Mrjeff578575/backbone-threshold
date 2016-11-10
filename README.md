## 使用说明
- 要使用这个组件，你首先的复制这两段模板到你的HTML文件的body中。然后引入这个组件的JS与CSS。
- 接下来你需要创建一个这个组件的实例。你可以定义组件所在的位置，组件主体所在的位置和组件时间栏所在的位置。
就像这样：

```
<script type="text/javascript">
	var threshold = new newThreshold({
		maincontainer:'#app',//组件挂载点，param:string,带上标签选择器
		body:'#threshold_body',//内容挂载点param:string,带上标签选择器
		timebar:'#threshold_bar'//头部底部挂载点param:string,带上标签选择器
})
```
#### HTML结构
	div#app
		div#threshold_body
		div#threshold_bar
然后就可以愉悦的使用啦