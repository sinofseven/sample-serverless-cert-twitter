# sample-serverless-cert-twitter
serverless frameworkを使用してtwitterのoauth認証によってAccessTokenを取得するためのサンプル

# 使い方
config.sample.ymlをコピーしてconfig.ymlにし、  
twitter appのconsumer keyやtmp dataを格納するs3 bucketの名前を記入する。  
```npm run deploy```でAWSにデプロイする。   
https://*******.amazonaws.com/dev/cert にブラウザからアクセスしてTwitter認証を行う。  
