#!/usr/bin/env Rscript
suppressPackageStartupMessages(library(data.table));a<-commandArgs(trailingOnly=TRUE);d<-fread(a[1]);x<-d[temporal_scale=="annual"]
b<-x[dataset_type=="historical"&year>=2000&year<=2020,.(baseline_mean=mean(value_mean,na.rm=TRUE)),by=.(unit_code,area_class,variable)]
p<-data.table(period_label=c("2021-2040","2041-2060","2061-2080","2081-2100"),start=c(2021,2041,2061,2081),end=c(2040,2060,2080,2100))
o<-rbindlist(lapply(1:nrow(p),function(i)x[dataset_type=="projected"&year>=p$start[i]&year<=p$end[i],.(future_mean=mean(value_mean,na.rm=TRUE),p10=quantile(value_mean,.1,na.rm=TRUE),p90=quantile(value_mean,.9,na.rm=TRUE)),by=.(unit_code,area_class,variable,scenario,model)][,period_label:=p$period_label[i]]));o<-merge(o,b,by=c("unit_code","area_class","variable"),all.x=TRUE);o[,`:=`(absolute_change=future_mean-baseline_mean,percent_change=100*(future_mean-baseline_mean)/baseline_mean)];fwrite(o,a[2])
