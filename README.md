# Weibo comment data visualization
This is a data visualization project based on Weibo comment data. It can help you better understand the relevant comments on a Weibo topic, discover the development of the topic's popularity over time, the focus of comments in various regions of China, and netizens. Emotional response to the event, in order to achieve the purpose of public opinion monitoring.

## Open Method
Please use VScode to open the project, and use the live server plug-in in index.html to open it.

## How to use
Click the circle on the timeline that represents a specific topic, and the corresponding risk of public opinion getting out of control, keywords, word cloud, and sentiment analysis around the map will change accordingly. There are three grades of high, medium, and low risk of public opinion out of control, which are comprehensively obtained based on the number of comments and sentiment analysis. The size of the circle represents the volume of comments and the popularity of the topic. The size of the primitives on the map represents the number of comments from the region, and the keywords in the primitives are the words that appear most frequently in the reviews of the region. The word cloud shows the keywords that appear frequently in the topic.

## data
We used comments on multiple related topics under the Zhang Heng and Zheng Shuang incident as the data for this work. We put the filtered data into the data folder and display it directly on the web page. For details on data crawling and sentiment analysis, please refer to the weiboSpider folder. This part of the code is adapted from [WeiboSpider_SentimentAnalysis](https://github.com/CUHKSZ-TQL/WeiboSpider_SentimentAnalysis).


# 微博评论数据可视化
这是一个基于微博评论数据的数据可视化项目，它可以帮你更好的了解某一微博话题的相关评论情况，发现该话题随时间的热度发展情况，中国各地区评论的关注点以及网友对该事件的情绪反应，以达到舆情监控的目的。

## 打开方式
请使用VScode打开该项目，在index.html中使用live server插件打开。

## 使用方式
点击时间线上表示具体话题的圆圈，相应舆情失控风险，地图各地关键词，词云和情绪分析四部分都会随之改变。
舆情失控风险有高、中、低三档，根据评论数量和情绪分析综合得出。
圆圈大小表征评论量的多少和话题热度。
地图上各地图元大小表征来自该地区的评论数，图元中的关键字是来自该地评论中出现最多的词语。
词云展示了该话题中出现较多的关键词。

## 数据
我们使用了张恒郑爽事件下多个相关话题的评论作为本工作的数据。
我们将筛选后的数据放入data文件夹下，直接在网页展示出来。
具体数据爬取及情感分析请详见weiboSpider文件夹，该部分代码改编自[WeiboSpider_SentimentAnalysis](https://github.com/CUHKSZ-TQL/WeiboSpider_SentimentAnalysis)。


