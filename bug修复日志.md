- ~~第一行改动失去焦点之后，再次获得焦点，然后直接save，无法取到第一行正确的值~~
- ~~功能不完整，没有输入表达式转换成threshold显示的功能(11.13修复)~~
- ~~持久化不错，但是再次打开页面的时候下面的时间轴没有对应的显示~~
-  ~~对于from和until时间相同的情况没有考虑到，也没有处理（已解决）~~
-  ~~随机颜色有时会出现连着两个相同的颜色重复出现的情况（删除颜色，buffer没有对应操作,重新刷新后buffer变为空,无法判断是否重复,解决方案：遍历存在的Model,如果小于6将其推入buffer，如果大于6，把余数部分推入buffer）~~
-  ~~输出的值最好放到一个textarea里面~~
-  ~~当添加一个anytime的threshold A之后，再添加一个其他时间的threshold B，再删除threshold B，这时的时间轴就一直是灰色了（已经修复）~~
-  ~~fetch之后颜色条没有正确显示(已经修复)~~
-  ~~fetch到数据之后，如果有allday颜色显示正常，但是当点击allday的save按钮时，颜色条会被清空（已经修复）~~
-  ~~修复当allday在第一行时，第二行添加其他颜色的时候，timechart会expand的问题~~
-  ~~修复ESC和点击其他地方退出时，触发editfromTime的问题~~
-  ~~相同颜色存在的时候，改变其中一个的长度，另一个会被删除(2016.11.13已经修复)~~
-  ~~当fetch数据之后，改变最长的那个颜色条，save之后，被覆盖的颜色会消失，必须重新点save之后才能正确显示。~~
-  ~~修改数据的时候,textarea显示不正确（已经修复）~~
-  ~~fetch到all day（由相同time改变的all day）数据的时候，显示不正确(初步判定是endtime没有清空导致)(直接在fetch时候判定，(11.13修复))~~
-  ~~相同time产生的all day具有expand（(11.13修复)）~~