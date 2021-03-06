## 使用说明
- 要使用这个Threshold组件,首先你需要复制两段模板文件到你的HTML的body中,分别是
```
<script type="text/template" id="item-template">
```
```
<script type="text/template" id="stats-template">
```
- 然后你需要引用组件的app.js和app.css到你的HTML中
- 千万不要忘记还需要引入这些文件：

```
<link rel="stylesheet" type="text/css" href="yourpath/font-awesome.min.css">
<script type="text/javascript" src='yourpath/jquery.js'></script>
<script type="text/javascript" src='yourpath/underscore.js'></script>
<script type="text/javascript" src='yourpath/backbone.js'></script>
<script type="text/javascript" src="yourpath/backbone.localStorage.js"></script>
```

- 接下来你需要实例化这个组件，并自定义属于你的组件内容挂载点
- 如果你需要直接将输入值转化为一行threshold,就得把你的输入框的id选择器挂载到组件上，除此之外，添加按钮也不要忘记
- 最重要的一点就是新生成的threshold不能直接转化在time chart上，你可以选择刷新这个页面或者双击该行进入编辑模式，点击save按钮可以保存。
- 更多丰富的自定义内容尽请期待,
这里我提供组件的挂载内容示范，就像这样：

```
<script type="text/javascript">
	var threshold = new newThreshold({
		maincontainer:'#app',//组件挂载点，param:string,带上标签选择器
		body:'#threshold_body',//内容挂载点，param:string,带上标签选择器
		timebar:'#threshold_bar',//头部底部挂载点，param:string,带上标签选择器
		input: '#thresInput',//输入内容框，param:string,带上标签选择器
		add: '.Textadd'//页面上的输入添加按钮，param:string,带上标签选择器
})
```
#### HTML结构
	div#app
		div#threshold_body
		div#threshold_bar
	input#thresInput
	button.Textadd

#### 界面预览
![image](https://github.com/Mrjeff578575/markdownphoto/blob/master/Threshold.jpg)
	
#### 显示内容说明
- From列支持选择all day选项,当From和Until列值相同时，则自动转变为all day,一个页面只支持一个all day,具有allday的那一行的From会跨度为两列宽,Until列消失
- Comparsion支持操作符选择，提供三种操作符**>, <, =**
- Alerts列也提供三种报警值的输入，如果缺省则只显示warning,如果不是缺省则只显示有具体输入内容的报警值。

#### 输出内容结构说明
1. 时间：**(<hh:mm> <hh：mm>)** 或空字符串， 空字符串表⽰示时间段为全天
2. 操作符：只支持 **>, <, =**
3. 报警值：依次为**warning,error,critical**，以空格分割，如果某一项缺省，后面的自动往前进，具体还是要看图表

#### 输入内容说明
1. 时间只支持 **(<hh:mm> <hh：mm>)** 或**空字符串**，并且分钟只能准确的显示00 15 30 45这种类型的，如果不是这几种类型，会自动转变位置最近的那一个。
2. 操作符只支持 **>, <, =**
3. 报警值只支持三个，需要以空格进行分割，第一个自动被识别为warning，依次类推。报警值只支持数字