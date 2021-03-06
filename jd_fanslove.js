/*
粉丝互动
类似于京东抽奖机，各个店铺的粉丝互动活动。
by i-chenzhe
*/

const $ = new Env('粉丝互动');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [], cookie = '', originCookie = '', message = '';
let helpAuthor = false;//为作者助力的开关
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = JSON.parse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }
  await getACT_ID();
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i]
      originCookie = cookiesArr[i]
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      $.sendNotify = false;
      $.bean = 0;
      if ($.ACT_IDarr.length > 0) {
        for (let i = 0; i < $.ACT_IDarr.length; i++) {
          $.ACT_ID = $.ACT_IDarr[i].ACT_ID;
          await fansLove();
        }
      }
      if ($.bean >= 10) {
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}`, `京东账号${$.index} ${$.UserName}\n恭喜中奖，共获得${$.bean}京豆`);
        } else {
          $.msg($.name, `恭喜中奖共获得${$.bean}京豆`);
        }
      }
      if ($.sendNotify) {
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}`, `京东账号${$.index} ${$.UserName}\n${message}`);
        } else {
          $.msg($.name, `恭喜中奖\n${message}`);
        }

      }
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })
async function fansLove() {
  $.risk = false;
  await grantTokenKey();
  await $.wait(1500)
  await grantToken();
  await $.wait(1500)
  await getActCookie();
  await $.wait(1500)
  await getActInfo();
  await $.wait(1500)
  await getMyPing();
  await $.wait(1500)
  await getUserInfo();
  await $.wait(1500)
  await getActContent(false);
  if ($.actInfo.endTime > Date.now()) {
    if (!$.risk) {
      await $.wait(1500)
      await getActContent(true);
      await $.wait(1500)
      await getActContent(false);
      if (($.actorInfo.fansLoveValue + $.actorInfo.energyValue) >= $.actConfig.prizeScoreOne && $.actorInfo.prizeOneStatus === false) {
        await doTask('wxFansInterActionActivity/startDraw', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}&drawType=01`);
      }
      if (($.actorInfo.fansLoveValue + $.actorInfo.energyValue) >= $.actConfig.prizeScoreTwo && $.actorInfo.prizeTwoStatus === false) {
        await doTask('wxFansInterActionActivity/startDraw', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}&drawType=02`);
      }
      if (($.actorInfo.fansLoveValue + $.actorInfo.energyValue) >= $.actConfig.prizeScoreThree && $.actorInfo.prizeThreeStatus === false) {
        await doTask('wxFansInterActionActivity/startDraw', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}&drawType=03`);
      }
    }
  } else {
    console.log(`${$.actInfo.shopName} 活动已经结束`);
  }



}
function getActContent(doJob = false) {
  return new Promise(resolve => {
    $.post(taskPostUrl('wxFansInterActionActivity/activityContent', `activityId=${$.ACT_ID}&pin=${encodeURIComponent($.secretPin)}`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.result === false) {
              $.risk = true;
              console.log(`京东说‘本活动与你无缘，请关注其他活动。’`);
              return;
            }
            if (doJob) {
              console.log(`开始执行 ${$.actInfo.shopName} 的任务`);
              await doTask('wxFansInterActionActivity/followShop', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}`);
              await $.wait(5000);
              if ($.task1Sign && $.task1Sign.finishedCount === 0) {
                await doTask('wxFansInterActionActivity/doSign', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}`);
                await $.wait(5000);
              }
              if ($.task2BrowGoods && $.task2BrowGoods.finishedCount !== $.task2BrowGoods.upLimit) {
                for (let vo of $.task2BrowGoods.taskGoodList) {
                  if (vo.finished === false) {
                    await doTask('wxFansInterActionActivity/doBrowGoodsTask', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}&skuId=${vo.skuId}`);
                  }
                  await $.wait(5000);
                }
              }
              if ($.task3AddCart && $.task3AddCart.finishedCount !== $.task3AddCart.upLimit) {
                for (let vo of $.task3AddCart.taskGoodList) {
                  if (vo.finished === false) {
                    await doTask('wxFansInterActionActivity/doAddGoodsTask', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}&skuId=${vo.skuId}`);
                  }
                  await $.wait(5000);
                }
              }
              if ($.task4Share && $.task4Share.finishedCount !== $.task4Share.upLimit) {
                for (let i = 0; i < $.task4Share.upLimit; i++) {
                  await doTask('wxFansInterActionActivity/doShareTask', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}`);
                  await $.wait(5000);
                }
              }
              if ($.task5Remind && $.task5Remind.finishedCount !== $.task5Remind.upLimit) {
                await doTask('wxFansInterActionActivity/doRemindTask', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}`);
                await $.wait(5000);
              }
              if ($.task6GetCoupon && $.task6GetCoupon.finishedCount !== $.task6GetCoupon.upLimit) {
                for (let i = 0; i < $.task6GetCoupon.taskCouponInfoList.length; i++) {
                  await doTask('wxFansInterActionActivity/doGetCouponTask', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}&couponId=${$.task6GetCoupon.taskCouponInfoList[i].couponId}`);
                  await $.wait(5000);
                }
              }
              if ($.task7MeetPlaceVo && $.task7MeetPlaceVo.finishedCount !== $.task7MeetPlaceVo.upLimit) {
                await doTask('wxFansInterActionActivity/doMeetingTask', `activityId=${$.ACT_ID}&uuid=${$.actorInfo.uuid}`);
              }
            } else {
              $.task1Sign = data.data.task1Sign;
              $.task2BrowGoods = data.data.task2BrowGoods;
              $.task3AddCart = data.data.task3AddCart;
              $.task4Share = data.data.task4Share;
              $.task5Remind = data.data.task5Remind;
              $.task6GetCoupon = data.data.task6GetCoupon;
              $.task7MeetPlaceVo = data.data.task7MeetPlaceVo;
              $.shopInfoVO = data.data.shopInfoVO;
              $.actorInfo = data.data.actorInfo;
              $.actConfig = data.data.actConfig;
              $.actInfo = data.data.actInfo;
              console.log('获取活动参数成功。');
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function doTask(function_name, body) {
  return new Promise(resolve => {
    $.post(taskPostUrl(function_name, body), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (resp['headers']['set-cookie']) {
              cookie = `${resp['headers']['set-cookie'].join(';')}; ${originCookie}`;
            }
            if (data.data !== null && data.result === true) {
              console.log('请求正常。')
              if (data.data.hasOwnProperty('drawOk')) {
                if (data.data.drawOk === true) {
                  console.log(`恭喜中奖，获得:${data.data.name}`);
                  if (data.data.name.indexOf('京豆')) {
                    $.bean += data.data.drawInfo.beanNum;
                  } else {
                    $.sendNotify = true;
                    message += `恭喜中奖，获得:${data.data.name}\n活动店铺${$.actInfo.shopName}\n领奖地址:https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/${$.ACT_ID}?activityId=${$.ACT_ID}&adsource=tg_storePage`;
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.log(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getUserInfo() {
  return new Promise(resolve => {
    let body = `pin=${encodeURIComponent($.secretPin)}`
    $.post(taskPostUrl('wxActionCommon/getUserInfo', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          data = JSON.parse(data);
          if (data.data) {
            console.log(`用户【${data.data.nickname}】信息获取成功`)
            $.userId = data.data.id
            $.nickName = data.data.nickame
          } else {
            console.log(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function getMyPing() {
  return new Promise(resolve => {
    $.post(taskPostUrl('customer/getMyPing', `userId=${$.venderId}&token=${$.token}&fromType=APP`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          data = JSON.parse(data);
          if (data.result) {
            $.secretPin = data.data.secretPin
            cookie = `AUTH_C_USER=${$.secretPin};${cookie}`
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getActInfo() {
  return new Promise(resolve => {
    $.post(taskPostUrl('customer/getSimpleActInfoVo', `activityId=${$.ACT_ID}`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          data = JSON.parse(data);
          if (data.result) {
            $.venderId = data.data.venderId;
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function grantTokenKey() {
  let opt = {
    url: 'https://api.m.jd.com/client.action?functionId=genToken',
    headers: {
      'Host': 'api.m.jd.com',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Cookie': cookie,
      'User-Agent': 'JD4iPhone/167538 (iPhone; iOS 14.3; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    body: `body=%7B%22to%22%3A%22https%3A%5C%2F%5C%2Flzkjdz-isv.isvjcloud.com%5C%2FwxFansInterActionActivity%5C%2Factivity%5C%2F${$.ACT_ID}c%3FactivityId%3D${$.ACT_ID}%26adsource%3Dtg_storePage%22%2C%22action%22%3A%22to%22%7D&build=167541&client=apple&clientVersion=9.4.0&joycious=39&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=385f383ec315d8d01c64a09021df04ef9930c99d&scope=01&sign=49f56090e3f09b668f1afaf8894fdb42&st=1613530021485&sv=111`
  }
  return new Promise(resolve => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        }
        else {
          data = JSON.parse(data);
          if (data.code === '0') {
            $.tokenKey = data.tokenKey;
            cookie = `${cookie}IsvToken=${$.tokenKey}`
          }
        }
      } catch (e) {
        console.log(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function grantToken() {
  let opt = {
    url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator',
    headers: {
      'Host': 'api.m.jd.com',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Cookie': cookie,
      'User-Agent': 'JD4iPhone/167538 (iPhone; iOS 14.3; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    body: `body=%7B%22url%22%3A%22https%3A%5C%2F%5C%2Flzkjdz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167541&client=apple&clientVersion=9.4.0&openudid=385f383ec315d8d01c64a09021df04ef9930c99d&sign=b747c2565aca50d1e1dfb3544a9e04c8&st=1613530023543&sv=100`
  }
  return new Promise(resolve => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        }
        else {
          data = JSON.parse(data);
          if (data.code === '0') {
            $.token = data.token;
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        resolve();
      }
    })
  })
}
function getActCookie() {
  let opt = {
    url: `https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/${$.ACT_ID}?activityId=${$.ACT_ID}&adsource=tg_storePage`,
    headers: {
      'Content-Type': 'text/plain',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Cookie': `${cookie}`,
      'User-Agent': 'jdapp;iPhone;9.3.8;14.3;network/wifi;ADID/;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone10,3;supportBestPay/0;appBuild/167538;jdSupportDarkMode/0;addressid/0;pv/1.12;apprpd/Babel_Native;ref/JDWebViewController;psq/11;ads/;psn/;jdv/0|;adk/;app_device/IOS;pap/JA2015_311210|9.3.8|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
  return new Promise(resolve => {
    $.get(opt, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        }
        else {
          cookie = `${cookie};`
          if ($.isNode())
            for (let sk of resp['headers']['set-cookie']) {
              cookie = `${cookie}${sk.split(";")[0]};`
            }
          else {
            for (let ck of resp['headers']['Set-Cookie'].split(',')) {
              cookie = `${cookie}${ck.split(";")[0]};`
            }
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        resolve();
      }
    })
  })
}
function taskPostUrl(function_id, body) {
  return {
    url: `https://lzkjdz-isv.isvjcloud.com/${function_id}`,
    headers: {
      'Host': 'lzkjdz-isv.isvjcloud.com',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://lzkjdz-isv.isvjcloud.com',
      'Connection': 'keep-alive',
      'Referer': `https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/${$.ACT_ID}?activityId=${$.ACT_ID}&adsource=tg_storePage`,
      'Cookie': `${cookie}`,
      'User-Agent': 'jdapp;iPhone;9.3.8;14.3;network/wifi;ADID/;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone10,3;supportBestPay/0;appBuild/167538;jdSupportDarkMode/0;addressid/0;pv/1.12;apprpd/Babel_Native;ref/JDWebViewController;psq/11;ads/;psn/;jdv/0|;adk/;app_device/IOS;pap/JA2015_311210|9.3.8|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
    },
    body: body,
  }
}
function getACT_ID() {
  return new Promise(async resolve => {
    $.get({ url: `https://api.r2ray.com/jd.fanslove/index?ts=${Date.now()}` }, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.data.length > 0) {
              $.ACT_IDarr = data.data;
              console.log('获取活动信息成功');
            } else {
              $.ACT_IDarr = [];
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0") : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = data['base'].nickname;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}
// prettier-ignore
function Env(t, e) {  class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
