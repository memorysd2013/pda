# 系統功能配置規格

## caseListBeginWeekday
> default: 0 (If the locale assigns Sunday as the first day of the week, 0 will be Sunday)
> 取得案件列表的當週起始日, 案件列表均預設為取得一週, 所以結束日自動帶入起始日 t + 7

## caseListDurationOfWeek
> default: 12 (about 3 months)
> 總共取得列表的週數, 預設 12週

## loginTokenRetryInterval
> default: 30 (seconds)
> 當 login 頁面 token 取得失敗時, 再次嘗試取得 token 的間隔秒數

## apiFailedRetryInterval
> default: 2 (seconds)
> 當 api 發送失敗時重新發送的間隔秒數。若小於 1 會視為 1 秒。

## apiFailedRetryTimes
> default: 3 (times)
> 當 api 發送失敗時重新發送的次數。若次數為 0 則不會重新發送。