/*
母婴-跳一跳
活动入口: 首页-母婴馆-跳一跳
没有添加助力环节，本期活动合计京豆50W;
新手写脚本，难免有bug，能用且用。     
                              
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#母婴-跳一跳
5 8,14,20 2-7 3 * https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_jump-jump.js, tag=母婴-跳一跳, enabled=true
================Loon==============
[Script]
cron "5 8,14,20 2-7 3 *" script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_jump-jump.js,tag=母婴-跳一跳
===============Surge=================
母婴-跳一跳 = type=cron,cronexp="5 8,14,20 2-7 3 *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_jump-jump.js
============小火箭=========
母婴-跳一跳 = type=cron,script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/jd_jump-jump.js, cronexpr="5 8,14,20 2-7 3 *", timeout=3600, enable=true
*/
const $ = new Env('母婴 - 跳一跳');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [], cookie = '', message = '';
const ACT_API = 'https://sendbeans.jd.com/jump/';
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

var _0xodC='jsjiami.com.v6',_0x296f=[_0xodC,'wrjCiE7DgHrChcOAW8KQJ8OMw6xSw48aMU4rw78swpTCusOgwohdw7HCs8KbHMOhS8K2b8K3H8K/w5g5acOpCVHDuCthw4vCkkXCksOyw6NJwrbDiCHClHxWVcKvJzYyPUvCocOLwoADwpbChz3DmcKEwp7CnXvCqFUGPMKWHsKOcsOfK8KbYABwU8KoLsOCw5ljw5bDi8KTwqsXwrLDuV/DkWzDgmJGE8KOKA8mfcKGw6IXYDXCvsOxw4/ClFfDtcO6w6RuKCPDmTRResKkJHzDusKBU3PCnsKIw6rDqVcOW8O6HENJHcOgdVo9dl7DtsO0w7F+wp7DqsK6w4nCjVPDoT/CksObaz4sw6fCpUPDt0IMaQnDjcKNw5UHVMK2w6gLwoXCpCHDpGwUKcObEMOALsKaecKNw7dLwp/DlSFYw6hlw4vCnF/DlC0DGGxDwpsbTg1ww6txCsK9c8OMc8ORLsKdw5gGZgZxwoVVL1oMVsORSMKZcsO3WVkiE1fDssKFwqgJZAXDiMOXdcKuB8O4UsOYw6RTwpRpAiDDnwbCuiPCkF8bw49PQnEew4/DqSLDlTTCi8KaPG1FwrjDj1DDgsOfw5zCvcOUw48OwqrDm8KHUMOAwq7CowglM8OiwpbDiMOCw6UDw79ow7jCscO1w5U3OMKrwqzDhVwCw7bDr1XDqVfCvsKMRWNleXQPNRXCqcOGwqdjNsKYM8OSfFl5ESnDqCgnG1LDtcOCw5hVw6oKw4rCncOKIkBswrk5w4DChcOXw7vDhBI=','wqDCssKnSFo=','w7fCoAcRwqU=','w5PDlggaw5XDlcOrw5ArF3jCscKOwoJ8wobDtw==','JFpqAsOS','wqrCs8Oiw53Cow==','w6NgwrhzwpY=','UwhTBsOOw6kcK8Kg','w7bDq8Kp','MsOcwrYGwqU1VsKeFFQ=','A8OCbsK6EFl5Y34aw61GwrNKQcKrYsOzwoRwwr/Dq8ORUmQgw4dbwrnDoRLClMKVwrXCiVHCs8K1w6rDk2jDpcKSe8KXw5fDk8O5CWzDkTnDlMO8wqM2w4PDqcOUdsKAwobDjDfDpcOjw7BddMK9bcOyw7I6eAREGsKywqE2ZVYEwqlOw50Pw4HCgWLDlcKifQdWWMOnbDfDkMOeAsOtw5R/BMOvwqnDmBhlAsOxw5XCgMObwrEQwpnCgsK0AmImwrsvABnDjHEMUinCqGMfw41qMsO1wo/DvQdvwrDDosOJw4fDmMKIVcKofcKJJsK5wpEIMsKtXcOPEMK9wqjCj2fCkX/CgwHCl8KGVMOJQMK6W8OQGcKAwrcfwr98wobDoy4IP1N2w7bCrsKvPsKww4PDt2VQTsKCw4Rtw6Q2EsK1MlZpwqHDgRZEwq0DVcKIwq7DgCMtWSgfw6nDpMOgwoQtw4IEw5bDm8Oqw5TCtMOLYV1dwqDDgh1zw6hfwovCnBNTwrdEX8Onem5PcsK2ZiEoHcOWWBrDsMKLfxIhLMOQK3zDn1vChERDw4vCrcObcSDChGLCuT7CpcK3b8OhCMOqFl3Dk8O/J8OndsKAIhTDkklyw7bCo8KDwo3CtMOnb8OQK8Kjw6Y3w6xgw41LwqMZL8OSw50kw5ImXD3Ds8KKMsKjKMK1WEDCiyZMQMOEw7IvU8KDFcK8TxM9wpp7wrbCpDnDncKvTRHCvB7Dl1EDw5U0esO/RcOoKMKiwrBaVUvDksKBMmwXwofClMKiw5M=','wo0Xwp8hRA==','wojCo1fDglg=','wrrDlsKrMhA=','BMKmaMKcFGDCiD/DpRgCScKrwp7ChcKabMOxwrJuwr/DuTLClsOgwr/DuMK9wqbCixQXwr4bRkLDihfDpcKlw4HCn8KTwrvDqDNKwodww7gHwoRiwpo+w5fDi2ZJwq7CmG3CkMOnwovDgMOIwqUOSjPCp8K6UmUaVcOQVRwFA8KNbWzDjQ==','wpsBHQ3DjA==','AwHDgzI=','H8O7K8O/wrDCnMOwQ8O8Ol/DnSbCgMKOw75sw6PCnxoLR1rCh3/DuXXDjDXCmh8Z','E8K3bS9rw4nDscK6w7rDtsKiEsO1wpbChDjDug==','wqV0w7oow6YsfQ4Cw68KL1QvMsOWLhsvw4LDkMOFwoLDgA4zwrTDnsKfUVURN8OxOsOpQsOBwrjCpknCsADCjBvCjsO0w53CusOQwo9fJ8KGw7vDgB0Dw4oqw5LCu24owolIaMKdXMKaw4Qnw4bDoB1HTw==','wqovw53DsMKXwpbDuMK+woDCucKQw5zDu1nDoMOKw7fDssO3wqPDigXDgsOzMhHCuAjCjDFgK8K1','BhgyRWs=','wqjChALDk2Q=','DEsGw51e','wqZjw5U3w7Jy','w4bDi8OrGjLDncOVNwXCocObw6rDlg==','wq4xw5s=','K1wAw6FMw7EARcK3wrzCmcKbwoo=','wqfDm8OyNR9UwqQ=','W8OBwr/DtMOb','w77Crz57fDFQ','PsOEecKFFw==','SsOzbSs=','ZUV7AcOQw7BgHcKu','w4g2w6A=','w69Rw4sR6K2h5rGV5aSl6LW7772m6K235qKk5p6v57y+6Le56YeR6Kyx','RcOFKMK9woHDgEI=','wqZjw5c3w7F+eg==','HgAeXGY=','w67CqCo0wpNTwq4B','T2rCgcOZwpsE','TsK9RGHCjw==','44G85oyC56Sm44O96K6Q5YSS6IyQ5Y+G5Li65Lmh6LWK5Y+a5LuJwpjCi8KbdMK2wr0A55ml5oy/5Lyi55eTwoHCtMOzwrfClsOF55uk5Lua5LuQ56yK5YmZ6I6c5Y2y','X8OUKMKuwp3Cngg3w53Cq8OPZsKMMsObw63DqMKOwpB4ScKMbzwPwoHCg3hOwqXDjMK0wpvDgipew7E0w6jDisK+d8Kh','AcKhew==','wqnCjMOAw7k=','wpxRw7Q9w4E=','wo9oDFE5','woEAwrMgX8KVwrsn','Nxgpw7bCgA==','SRJFCsOY','wqTDksKjwqFiZx3CkQ==','Bk/DmXTDrA==','w59Xwo8=','wr7ChktAw5PDn8Kl5b615aaG44Gr5Lq15LuZ6LeN5Y2Z','w53DggUPwoE=','NGs6w4ZRw5U/fw==','wqbCpcKeZUvCssKtQm7DrA==','wroSwrs3','44O95o+356Wa44OtwoPDmQHCksO5woHltZnlp4DmlKo=','5LuF5Lq66LSp5Yy9','w4oww6TDlMK0HU8i','w4Xor6fphZbml6jnm63lvYLojqPljohgw6gQPh9lJsOLL0txwpLCisOFw53DlUESwq7CmMKyfV8yEcK1EcOyFMOqw6fDrTnCnUvDkE3CksK7wozDrsO6wqZ/','wrrDssOAKDg=','w6XDvMO6IAXDvQ==','ScO5cDseNlnDqm95','wqFxw7Y9','w6PCriY0wpRX5bSx5aWV5pWmwolUTA==','IcK+YS0JwojDuMK6','5Lm15Lue6LeJ5Y+I','Peitl+mGkeaVruealeW/seiOkOWPjsOcwqHDgWPDizo=','CxcuR0g=','NMOS5aS36LSww6rDu+WOhuWbsCnCjQ==','YcOVZsKJ','wq3CgsOEw7JjDgI5w67Cpg==','w4Fdwot7worCpx0=','6L2V5rOU5pyH5pKH6ame5a6C55ux5p6E5L2y77+m56iU5ZG05Ye75bGf6K6r','RcOPPcK6wrHDhkt3w5zCpQ==','FsKiazI=','5ZGm5ZO9ZemAmOWLjeS6tOeBu+W9nQ==','5bSy57mx5Yq26L+v57q254KZ77+J6IGg5b2R566e5b+P5rak5YmZ57mQ5p2s55CC5Yu85LqF6LCs44Kw','RsOPw7bChxA=','fERkGMO/w7R9EsKhGMKsEkoWRQhvwpI=','FlTDmHTDsmHDhjY=','VMOBDMK1wos=','e8OCwqDDjw==','CgM8QnTDh8OFTg==','w6oQeg==','OCUrYk0=','UlPCgcOdwqs=','W8OPOw==','wpLClcOdwrNY','woQbwqw8fw==','wrEBwqQ9Y8K3wrkmWw==','XMOLwrPDlcOC','Em08w5d6w4ch','wqvCgsOK','5oi96KC15Lqm5Yi05ou45Yin','NcKKF8KL','wrXDjcOjIzdOwqMf','EsOkPA==','LMKCHcKUw5Zrw5HCjQ==','wrfCo8KCWg==','w7zotLfkuoPotbzDjOW9iuWJpeS/s+e/u++8jMOY','Y0JsGsO3w7lvFA==','w5HmoY8v5pG/6aik5ayG5q2i5pWP7766','PcOQwrATw4QxXMKD','VcOyccK6Wg==','wrjCrcOgw6rCinxOw4o=','wrXCrcKI','Bko6w4Rs','wrLCnsOIw65nBQk0','w7rDosOsHwU=','UsOPw4/CmA==','w7fCoCAr','w6vDvcOdKyjDtsOhBw==','w77CuCN7STxBNA==','w4nCiS55Rw==','ScOBw4E=','dsOqHjrCkQ==','GMKiYw==','5b2h5aar5aa055GR6LSe6Zm6','wqw6NwTDq8K3wpRibR3DqTlN','wpYcSlzDpx8tWcOP','w7XCryR4aS0=','w70AfcKo','wrjDlMKhwq5uah/Cl8KCwpBFwqbDvA==','w5PDgw4OworCvMOhw5Mi','wrg0w5g=','CGjDmXHDgg==','wrDCjMOEw6g=','McOtZ8KIMA==','wqbDl8KKwp1p','wrgcwrE=','IybDuDjCng==','D0LDk2HDj2c=','wrfCmMOew7Q=','XcOzcTsjEEPDpWY=','w5cyw7I=','wq7Co8KGSw==','wpMUw4XDnsKu','ScOESSk9','wqzDkcOh','b8OEF8K1wr0=','Fnk2w4A=','GcOuLw==','XMOvOMKpwpc=','wpt+w7I+w7c=','acOVbw==','fcKAdHrCucKYdnR2','wqcGwrUxdMKHwqU=','w6TChkE=','6aG35Y6l5oi15Yqn776Y6K6h6L6X5Zuhw4HCginmnYvnnKrku5bosJrlppXlirvjgLU=','w5PClsKyDsOew5Y=','LkdJ','wqMSwr8m','b8KTb2E=','wrXCiVs=','wq3DnsK0wohJZx7CpsKMwqtNwqfDrMK6','w4nCkcKOCMOUw5TDrDbDjg==','wrfCjMOfw69L','w7vCnEXDqcKfw6vDrA==','M8OgE8K4ew==','Nhwzw7LCnMOQ','5pyj6L+U6Ly26KOQ6I2e5b+h5LmS5LuT5aSw5YqF77+Zwqk=','RcOxJyHCqA==','w4o4w6rDmg==','wrDDjsKj','wobClcObwqFO','w4bDj8KdUGA=','w6DDoMOTChPDqg==','w4APw7XDmcKN','woXDm8OwEC0=','wrfCgsOew6g=','e8KHb2PCgw==','w5PDusKUc3A=','5b6O5bq3776u','GwIoTU7DgcOfQ8OV','woFNAcKTwrE=','RQ5TAMOSw40aKcK8','w4fDmQIJwpzChsO8','5pGA5Lyp5oie5Ymf','w6fDiAQewro=','DsODe8KeDw18QA==','AmjDqkLDjg==','eglNKMO0','w5/Dn8Keb24=','wqN/w7w=','5b6P5bmN77yU','w7/Du8OGJg/Dv8OuDj0=','wrrDmsKywrlJ','fMKTcnTCuA==','wqfCgknDmWTDl8OaYw==','P8OQwr8Cw60m','w7jDtsOEKg==','FRnDgDI=','DH07w518w508fw==','wpdRLE4rwrrCksOR','wpMGQ14=','w6zCri4=','w5ZKwppxwpHCnB0IN3HDosOX','wqbDlMKnwo9edA==','KsOFwrnChsKKBijCg8O9','w5fDi8KF','wqTCi0vDh0M=','BMOvRcKhFA==','AMK9ew==','5b+g5buM7761','wq40JBPDjA==','OMOaHcOVwrE=','w6gHfMKvwpzCkRrDmg0=','5pGR5YiB5LqP','w6zCiFLDqw==','EMKkZzoXwobDvMKxw6g=','wrASwqIz','w6oHZ8KkwqfCvBPDkQ==','wrvCtsOqw6vCiGxF','wrXCnkbDlEPDkMOPZA==','GsOqL8Oy','wqDCn8OEw7hnBQk0','LsKEGQ==','wrzCsMKdUHAfwq18N8KXwrgP','DMOSw6DDksON','w7TCil/CjSzDm8OAb8OF','wqF2AsKwwq0=','KmvDj1XDnw==','wo7Cm8OI','5b6x5biA77+y','J8OgFcKqbQ==','DMOELMOxwq4=','DMOUfcKlEiF/V3M=','L1tJ','f8OWwqrDmMOJEDI=','DQ/Dlw==','wqpiw6k3w6RacS0Zw6EDLw==','w59Xwo9bwpHCow==','QsORNcK8wqI=','wpPCmMOqwqN6','TcO/NA==','5b+Q5buU77y1','w7vCnVTDo8KUw7/DtnnCnQ==','w4TDjRMZwpw=','wqvCucOsw5hK','wrfCnl3Dn3jDvcOGb8Kd','wqrDi8OrIT9DwrEZw6TCvj7DpsK1w6ZHwr/Ck0U=','wpUSUVk=','w6cAY8Kwwq/CsQHDlx7Cg20DMicKw71RRQ==','wqfCn0rDgkPDkMOPZA==','HMOVasK4KQx2XA==','B0bDiWc=','VMOVLsKswovDilNfw43Cp8OK','TBNG','BcOFw6LDkcOTw7TDvMKpDQFmbQ==','dMKdYVDCucKp','JMOkCcK9asOvfWTClmzDg8OKUmwjw5g=','wqbCncOdw7BHCA4vw6LCu8ONw6oqWE9m','NjAsjpiamiCZT.com.v6tgTOtDDnlA=='];(function(_0xc0b040,_0x5cf66a,_0x47f8e0){var _0x4a34a8=function(_0x2fb7f7,_0xc1bfd1,_0x2d2fa5,_0x41313c,_0x4f2327){_0xc1bfd1=_0xc1bfd1>>0x8,_0x4f2327='po';var _0x47e286='shift',_0x28badf='push';if(_0xc1bfd1<_0x2fb7f7){while(--_0x2fb7f7){_0x41313c=_0xc0b040[_0x47e286]();if(_0xc1bfd1===_0x2fb7f7){_0xc1bfd1=_0x41313c;_0x2d2fa5=_0xc0b040[_0x4f2327+'p']()}else if(_0xc1bfd1&&_0x2d2fa5['replace'](/[NApCZTtgTOtDDnlA=]/g,'')===_0xc1bfd1){_0xc0b040[_0x28badf](_0x41313c)}}_0xc0b040[_0x28badf](_0xc0b040[_0x47e286]())}return 0x75751};return _0x4a34a8(++_0x5cf66a,_0x47f8e0)>>_0x5cf66a^_0x47f8e0}(_0x296f,0x12a,0x12a00));var _0x50e6=function(_0x29fb6b,_0x47a157){_0x29fb6b=~~'0x'['concat'](_0x29fb6b);var _0x200a76=_0x296f[_0x29fb6b];if(_0x50e6['uRwfbV']===undefined){(function(){var _0x4fb925=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0xa58a44='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x4fb925['atob']||(_0x4fb925['atob']=function(_0xcd3856){var _0x45dc80=String(_0xcd3856)['replace'](/=+$/,'');for(var _0x2f3214=0x0,_0x23d18c,_0xeec4d2,_0x5d029f=0x0,_0x562c72='';_0xeec4d2=_0x45dc80['charAt'](_0x5d029f++);~_0xeec4d2&&(_0x23d18c=_0x2f3214%0x4?_0x23d18c*0x40+_0xeec4d2:_0xeec4d2,_0x2f3214++%0x4)?_0x562c72+=String['fromCharCode'](0xff&_0x23d18c>>(-0x2*_0x2f3214&0x6)):0x0){_0xeec4d2=_0xa58a44['indexOf'](_0xeec4d2)}return _0x562c72})}());var _0x181eb0=function(_0x15acdb,_0x47a157){var _0x1f1227=[],_0x1a64b2=0x0,_0x4328d7,_0x19d9ce='',_0x4fa7f6='';_0x15acdb=atob(_0x15acdb);for(var _0x366c3f=0x0,_0x24b1ff=_0x15acdb['length'];_0x366c3f<_0x24b1ff;_0x366c3f++){_0x4fa7f6+='%'+('00'+_0x15acdb['charCodeAt'](_0x366c3f)['toString'](0x10))['slice'](-0x2)}_0x15acdb=decodeURIComponent(_0x4fa7f6);for(var _0x40576a=0x0;_0x40576a<0x100;_0x40576a++){_0x1f1227[_0x40576a]=_0x40576a}for(_0x40576a=0x0;_0x40576a<0x100;_0x40576a++){_0x1a64b2=(_0x1a64b2+_0x1f1227[_0x40576a]+_0x47a157['charCodeAt'](_0x40576a%_0x47a157['length']))%0x100;_0x4328d7=_0x1f1227[_0x40576a];_0x1f1227[_0x40576a]=_0x1f1227[_0x1a64b2];_0x1f1227[_0x1a64b2]=_0x4328d7}_0x40576a=0x0;_0x1a64b2=0x0;for(var _0x232c7b=0x0;_0x232c7b<_0x15acdb['length'];_0x232c7b++){_0x40576a=(_0x40576a+0x1)%0x100;_0x1a64b2=(_0x1a64b2+_0x1f1227[_0x40576a])%0x100;_0x4328d7=_0x1f1227[_0x40576a];_0x1f1227[_0x40576a]=_0x1f1227[_0x1a64b2];_0x1f1227[_0x1a64b2]=_0x4328d7;_0x19d9ce+=String['fromCharCode'](_0x15acdb['charCodeAt'](_0x232c7b)^_0x1f1227[(_0x1f1227[_0x40576a]+_0x1f1227[_0x1a64b2])%0x100])}return _0x19d9ce};_0x50e6['pYdyIY']=_0x181eb0;_0x50e6['kHduWv']={};_0x50e6['uRwfbV']=!![]}var _0x5c47b9=_0x50e6['kHduWv'][_0x29fb6b];if(_0x5c47b9===undefined){if(_0x50e6['fveTvA']===undefined){_0x50e6['fveTvA']=!![]}_0x200a76=_0x50e6['pYdyIY'](_0x200a76,_0x47a157);_0x50e6['kHduWv'][_0x29fb6b]=_0x200a76}else{_0x200a76=_0x5c47b9}return _0x200a76};!(async()=>{var _0x1285e1={'SAoeW':_0x50e6('0','2GWc'),'zLFyF':_0x50e6('1','Qw1i'),'NzIIh':function(_0x4409e5,_0x18856a){return _0x4409e5<_0x18856a},'ehdrW':function(_0x209d1f){return _0x209d1f()}};if(!cookiesArr[0x0]){$[_0x50e6('2','2GWc')]($[_0x50e6('3','G9L2')],_0x1285e1[_0x50e6('4','BUl6')],'https://bean.m.jd.com/bean/signIndex.action',{'open-url':_0x1285e1[_0x50e6('5','o*@S')]});return}for(let _0x4353fa=0x0;_0x1285e1['NzIIh'](_0x4353fa,cookiesArr['length']);_0x4353fa++){if(cookiesArr[_0x4353fa]){cookie=cookiesArr[_0x4353fa];originCookie=cookiesArr[_0x4353fa];$[_0x50e6('6','j]U&')]=decodeURIComponent(cookie['match'](/pt_pin=(.+?);/)&&cookie[_0x50e6('7','Z[yy')](/pt_pin=(.+?);/)[0x1]);$[_0x50e6('8','utKN')]=_0x4353fa+0x1;$['isLogin']=!![];$[_0x50e6('9','y0JE')]='';await _0x1285e1[_0x50e6('a','f$^T')](TotalBean);console[_0x50e6('b','W*kL')](_0x50e6('c','toOG')+$[_0x50e6('d','toOG')]+'】'+($['nickName']||$[_0x50e6('e','gw#x')])+_0x50e6('f','fg4v'));if(!$['isLogin']){$['msg']($[_0x50e6('10','j]U&')],_0x50e6('11','S%A%'),_0x50e6('12','Ltlb')+$['index']+'\x20'+($[_0x50e6('13','*T$B')]||$['UserName'])+_0x50e6('14','BUl6'),{'open-url':_0x1285e1[_0x50e6('15','IlSe')]});if($[_0x50e6('16','fg4v')]()){await notify[_0x50e6('17','qq69')]($[_0x50e6('18','BUl6')]+_0x50e6('19','(o%5')+$[_0x50e6('1a','YGk^')],_0x50e6('1b','Gs#R')+$['index']+'\x20'+$['UserName']+_0x50e6('1c','Qw1i'))}continue}await jump()}}})()[_0x50e6('1d','2^6E')](_0x3a107f=>{$['log']('','❌\x20'+$['name']+_0x50e6('1e','btL@')+_0x3a107f+'!','')})['finally'](()=>{$[_0x50e6('1f','WEKW')]()});async function jump(){var _0x165be4={'Phznn':function(_0xce8c6a,_0x903792){return _0xce8c6a===_0x903792},'coIPj':function(_0x43de39){return _0x43de39()},'PSqFm':function(_0x138414,_0x12f06c){return _0x138414(_0x12f06c)},'qVgAB':_0x50e6('20','G9L2'),'mIRZF':'领取成功，请返回app查看京豆奖励。','JDOqW':function(_0x19b336){return _0x19b336()},'kOdwy':function(_0x49b69f,_0x320a89){return _0x49b69f(_0x320a89)},'Tnifa':_0x50e6('21','W*kL'),'caPke':function(_0x596803){return _0x596803()},'PHyVq':function(_0xdf0881,_0x377e80){return _0xdf0881<_0x377e80},'gReps':_0x50e6('22','IYWF'),'vmXPd':function(_0x1c6e96){return _0x1c6e96()},'PCdfZ':_0x50e6('23','Qw1i'),'WzMzJ':'哦吼,遇到了路障','XKhBP':function(_0x4b5126){return _0x4b5126()},'llJWE':_0x50e6('24','YGk^'),'MpEfJ':_0x50e6('25','(o%5'),'SKlNw':'开始拆弹','BFHoo':function(_0x5b47e5,_0x25f597){return _0x5b47e5<_0x25f597},'iAdxz':function(_0x106bde,_0x4cca77){return _0x106bde(_0x4cca77)},'sXWvm':'destination','jwVGA':_0x50e6('26','IlSe'),'XdKkS':function(_0x17ee2a){return _0x17ee2a()}};await _0x165be4[_0x50e6('27','6k6H')](getGameInfo);await $['wait'](0x3e8);if($[_0x50e6('28','56(D')]&&$[_0x50e6('29','f$^T')]){await _0x165be4[_0x50e6('2a','Qw1i')](getTool);await $[_0x50e6('2b','sJ*M')](0x7d0);if($[_0x50e6('2c','2^6E')]){return new Promise(_0x2f16ae=>{$[_0x50e6('2d','IYWF')](_0x165be4[_0x50e6('2e','2^6E')](taskUrl,_0x165be4[_0x50e6('2f','7R0%')]),(_0x28b0b0,_0x4cf3fa,_0x1b0acf)=>{try{if(_0x28b0b0){console[_0x50e6('30','Qw1i')](JSON['stringify'](_0x28b0b0))}else{_0x1b0acf=JSON[_0x50e6('31','AUCi')](_0x1b0acf);if(_0x165be4[_0x50e6('32','j]U&')](_0x1b0acf[_0x50e6('33','j]U&')],null)&&_0x165be4[_0x50e6('34','sJ*M')](_0x1b0acf[_0x50e6('35','gw#x')],!![])){console[_0x50e6('36','G9L2')](_0x50e6('37','Z[yy'))}}}catch(_0x67233b){$['logErr'](_0x67233b)}finally{_0x165be4['coIPj'](_0x2f16ae)}})})}await $[_0x50e6('38','KFW2')](0x7d0);if($[_0x50e6('39','IlSe')]){console[_0x50e6('3a','^IPL')]('用户信息获取成功,欢迎:'+$['userInfo'][_0x50e6('3b','KFW2')]+'\x0a开始\x20'+$['jumpActivityDetail'][_0x50e6('3c','Gs#R')]+_0x50e6('3d','C#&r')+$[_0x50e6('3e','56(D')]['currentGridNum']+_0x50e6('3f','!SNw')+$['userInfo'][_0x50e6('40','Ql(U')]);if(_0x165be4[_0x50e6('41','WEKW')]($['userInfo']['currentGridNum'],0x25)){if($['userInfo'][_0x50e6('42','C#&r')]<0x1){console[_0x50e6('43','Gs#R')](_0x165be4[_0x50e6('44','gw#x')]);return}else{for(let _0x3c1fed=0x0;_0x165be4['PHyVq'](_0x3c1fed,$[_0x50e6('45','G9L2')][_0x50e6('40','Ql(U')]);_0x3c1fed++){await _0x165be4[_0x50e6('46','fg4v')](throwDice);await $[_0x50e6('47','6k6H')](0x3e8);await getTool();await $[_0x50e6('48','(o%5')](0x3e8);switch($[_0x50e6('49','fg4v')][_0x50e6('4a','&X&u')]){case _0x165be4[_0x50e6('4b','&X&u')]:console[_0x50e6('4c','6k6H')](_0x165be4[_0x50e6('4d','QwV1')]);console[_0x50e6('4e','YGk^')](_0x50e6('4f','E!RB'));for(let _0x3c1fed=0x0;_0x165be4['PHyVq'](_0x3c1fed,$[_0x50e6('50','JSEi')][_0x50e6('51','!SNw')][_0x50e6('52','&X&u')]);_0x3c1fed++){skuList=[];skuList[_0x50e6('53','IYWF')]($[_0x50e6('54','y0JE')][_0x50e6('55','toOG')][_0x3c1fed][_0x50e6('56','WFWM')]);body={'activityId':'57','skuList':skuList}}await _0x165be4[_0x50e6('57','f$^T')](addCart,body);await $[_0x50e6('58','G9L2')](0x3e8);await _0x165be4[_0x50e6('59','Ltlb')](doTask);break;case _0x165be4[_0x50e6('5a','y0JE')]:console[_0x50e6('5b','j]U&')](_0x165be4['MpEfJ']);console['log'](_0x165be4['SKlNw']);for(let _0x3c1fed=0x0;_0x165be4[_0x50e6('5c','E!RB')](_0x3c1fed,$['medicine']['goodsInfo'][_0x50e6('5d','f$^T')]);_0x3c1fed++){skuList=[];skuList[_0x50e6('5e','G9L2')]($['medicine'][_0x50e6('5f','qq69')][_0x3c1fed][_0x50e6('60','*T$B')]);body={'activityId':'57','skuList':skuList}}await _0x165be4['iAdxz'](addCart,body);await $[_0x50e6('61','Gs#R')](0x3e8);await _0x165be4[_0x50e6('62','WFWM')](doTask);break;case _0x165be4[_0x50e6('63','qq69')]:$['destination']=!![];console[_0x50e6('64','IlSe')](_0x165be4['jwVGA']);return;default:_0x165be4[_0x50e6('65','Qw1i')](doTask);break}await $[_0x50e6('66','gw#x')](0xbb8)}}}else{return new Promise(_0x2a075b=>{$[_0x50e6('67','^IPL')](_0x165be4[_0x50e6('68','Qw1i')](taskUrl,_0x165be4[_0x50e6('69','BUl6')]),(_0x6f80e2,_0x490f45,_0x163677)=>{try{if(_0x6f80e2){console[_0x50e6('6a','WEKW')]('异常：'+JSON['stringify'](_0x6f80e2))}else{_0x163677=JSON['parse'](_0x163677);if(_0x163677[_0x50e6('6b','btL@')]===null&&_0x163677[_0x50e6('6c','j]U&')]===!![]){console[_0x50e6('6d','9U4D')](_0x50e6('6e','!SNw'));if(!$[_0x50e6('6f','W&ic')]){$[_0x50e6('70','tp$f')]($[_0x50e6('3c','Gs#R')],_0x165be4['mIRZF'])}}}}catch(_0x4cfcfd){$['logErr'](_0x4cfcfd)}finally{_0x165be4['JDOqW'](_0x2a075b)}})})}}await $[_0x50e6('71','j]U&')](0x7d0);await getBeanRewards();await $[_0x50e6('72','btL@')](0x7d0);console[_0x50e6('6a','WEKW')](message)}}function getBeanRewards(){var _0x2c06e1={'BZCWF':function(_0x436005,_0x23ecb1){return _0x436005(_0x23ecb1)}};return new Promise(_0x1965cf=>{$[_0x50e6('73','nr6i')](_0x2c06e1['BZCWF'](taskUrl,_0x50e6('74','y0JE')),(_0x4798ce,_0x3a8631,_0x2288f5)=>{try{if(_0x4798ce){console['log']('异常：'+JSON[_0x50e6('75','W&ic')](_0x4798ce))}else{_0x2288f5=JSON[_0x50e6('76','G9L2')](_0x2288f5);if(_0x2288f5['errorCode']===null&&_0x2288f5[_0x50e6('77','9U4D')]===!![]){for(let _0x3a1e6c=0x0;_0x3a1e6c<_0x2288f5[_0x50e6('78',')ElN')][_0x50e6('79','Z[yy')];_0x3a1e6c++){message=_0x50e6('7a','7R0%');message+=_0x2288f5[_0x50e6('7b','QwV1')][_0x3a1e6c][_0x50e6('7c','*T$B')]+_0x50e6('7d','2jo4')+_0x2288f5[_0x50e6('7e','AUCi')][_0x3a1e6c][_0x50e6('7f','[*Xh')]+'\x20京豆\x0a'}}}}catch(_0x54a5cf){$[_0x50e6('80','fg4v')](_0x54a5cf)}finally{_0x1965cf()}})})}function addCart(_0x95e40d){var _0x3c3b12={'dVrfw':function(_0x575a4b,_0x52313a){return _0x575a4b===_0x52313a},'EevAS':function(_0x25062a){return _0x25062a()},'cuivH':function(_0x44efe5,_0x3aaebc,_0x38ecd7){return _0x44efe5(_0x3aaebc,_0x38ecd7)},'cTeVu':'addCart'};return new Promise(_0x904760=>{var _0x40aaa6={'ljaoQ':function(_0x54a4b9,_0xd1992e){return _0x3c3b12[_0x50e6('81','*T$B')](_0x54a4b9,_0xd1992e)},'SdetC':function(_0x4d085a){return _0x3c3b12[_0x50e6('82','IlSe')](_0x4d085a)}};$[_0x50e6('83','G9L2')](_0x3c3b12[_0x50e6('84','btL@')](postUrl,_0x3c3b12[_0x50e6('85','[*Xh')],_0x95e40d),(_0x42bceb,_0x2cb8cb,_0x4a703d)=>{try{if(_0x42bceb){console['log'](_0x50e6('86','fg4v')+JSON[_0x50e6('87','2^6E')](_0x42bceb))}else{_0x4a703d=JSON['parse'](_0x4a703d);if(_0x40aaa6[_0x50e6('88','S%A%')](_0x4a703d[_0x50e6('89','utKN')],null)&&_0x40aaa6['ljaoQ'](_0x4a703d[_0x50e6('8a','toOG')],!![])){console['log'](_0x50e6('8b','IYWF'))}}}catch(_0x41cf4f){$['logErr'](_0x41cf4f)}finally{_0x40aaa6[_0x50e6('8c','toOG')](_0x904760)}})})}function getTool(){var _0x5b58d6={'Tzsro':function(_0x345591,_0x4dc09f){return _0x345591===_0x4dc09f},'aOWDu':function(_0x1ee564,_0x330fa7,_0x507754){return _0x1ee564(_0x330fa7,_0x507754)},'ZulGT':_0x50e6('8d','Ltlb'),'oqoJk':'&reqSource=h5'};return new Promise(_0x458a32=>{$['get'](_0x5b58d6[_0x50e6('8e','f$^T')](taskUrl,_0x5b58d6[_0x50e6('8f','utKN')],_0x5b58d6[_0x50e6('90','[*Xh')]),(_0x3114ad,_0x20af2a,_0x30ffd3)=>{try{if(_0x3114ad){console[_0x50e6('91','BUl6')](_0x50e6('92','IYWF')+JSON[_0x50e6('93','fg4v')](_0x3114ad))}else{_0x30ffd3=JSON[_0x50e6('94','y0JE')](_0x30ffd3);if(_0x5b58d6['Tzsro'](_0x30ffd3['errorCode'],null)){taskList=_0x30ffd3[_0x50e6('95','btL@')]['filter'](_0x318bb2=>_0x318bb2['state']===_0x50e6('96','nr6i'));$['roadBlockList']=taskList[_0x50e6('97','Ql(U')](_0x3eee85=>_0x3eee85[_0x50e6('98','fg4v')]==='road_block')[0x0];$['medicine']=taskList['filter'](_0x21b997=>_0x21b997[_0x50e6('99','E!RB')]===_0x50e6('9a','gw#x'))[0x0];$[_0x50e6('9b','o*@S')]=taskList['filter'](_0x1de5f1=>_0x1de5f1['type']===_0x50e6('9c','!SNw'))[0x0]}else{console[_0x50e6('9d','(o%5')](_0x30ffd3[_0x50e6('9e','W*kL')])}}}catch(_0x541726){$[_0x50e6('9f','y0JE')](_0x541726)}finally{_0x458a32()}})})}function throwDice(){var _0x54e533={'FQFFh':function(_0x5cf050,_0x56ba0c){return _0x5cf050===_0x56ba0c;},'lepll':function(_0x5a7794){return _0x5a7794()},'vgdwI':function(_0x378565,_0x24228c,_0x1a6a1b){return _0x378565(_0x24228c,_0x1a6a1b)},'mIJkt':'throwDice','yoguV':_0x50e6('a0','sJ*M')};return new Promise(async _0x3de283=>{$[_0x50e6('a1','[*Xh')](_0x54e533[_0x50e6('a2','nr6i')](taskUrl,_0x54e533[_0x50e6('a3','Ltlb')],_0x54e533['yoguV']),(_0x3169ae,_0x473cc9,_0x5c56ad)=>{try{if(_0x3169ae){console[_0x50e6('a4','2GWc')](_0x50e6('a5','AUCi')+JSON['stringify'](_0x3169ae))}else{_0x5c56ad=JSON[_0x50e6('a6','JSEi')](_0x5c56ad);if(_0x54e533[_0x50e6('a7','^IPL')](_0x5c56ad[_0x50e6('a8','IYWF')],null)){console['log'](_0x50e6('a9','56(D')+_0x5c56ad[_0x50e6('aa','9U4D')][_0x50e6('ab','YGk^')]+'点\x0a当前格数'+_0x5c56ad[_0x50e6('ac','j]U&')][_0x50e6('ad','IYWF')][_0x50e6('ae','C#&r')]);$[_0x50e6('af','nr6i')]=_0x5c56ad[_0x50e6('b0','^IPL')][_0x50e6('b1','G9L2')]}else{console[_0x50e6('b2','KFW2')](_0x5c56ad[_0x50e6('b3','Gs#R')])}}}catch(_0x4ddf3c){$['logErr'](_0x4ddf3c)}finally{_0x54e533[_0x50e6('b4','fjZ5')](_0x3de283)}})})}function doTask(){var _0x12a7b9={'LQbLM':function(_0x35a9e2,_0x45ad63){return _0x35a9e2===_0x45ad63},'ILrSd':function(_0x465bcc,_0x2be3ad,_0x1b4509){return _0x465bcc(_0x2be3ad,_0x1b4509)},'yusJz':'doTask','vzwth':_0x50e6('b5','nr6i')};return new Promise(_0x2fedf6=>{var _0x54bfbc={'rOwbw':function(_0x271ad1,_0x65bbd1){return _0x12a7b9[_0x50e6('b6','S%A%')](_0x271ad1,_0x65bbd1)},'uqibL':function(_0x430d9b){return _0x430d9b()}};$[_0x50e6('2d','IYWF')](_0x12a7b9[_0x50e6('b7','f$^T')](taskUrl,_0x12a7b9['yusJz'],_0x12a7b9['vzwth']),(_0x487376,_0x21957e,_0xf0ccf5)=>{try{if(_0x487376){console[_0x50e6('b8','AUCi')](_0x50e6('b9','W*kL')+JSON[_0x50e6('75','W&ic')](_0x487376))}else{_0xf0ccf5=JSON[_0x50e6('ba',')ElN')](_0xf0ccf5);if(_0x54bfbc[_0x50e6('bb','^IPL')](_0xf0ccf5[_0x50e6('bc','Ltlb')],null)){console[_0x50e6('bd','tp$f')]('执行任务'+_0xf0ccf5[_0x50e6('be','sJ*M')])}else{console[_0x50e6('bf','E!RB')](_0xf0ccf5[_0x50e6('c0','BUl6')])}}}catch(_0x11ca44){$[_0x50e6('c1','W*kL')](_0x11ca44)}finally{_0x54bfbc[_0x50e6('c2','Qw1i')](_0x2fedf6)}})})}function getGameInfo(){var _0x4006ba={'qlEcG':function(_0x52bc15,_0x129139){return _0x52bc15===_0x129139},'yuTwv':'getHomeInfo'};return new Promise(_0x599cd6=>{var _0x14462c={'lTADd':function(_0x1a40fc,_0x31254b){return _0x4006ba[_0x50e6('c3','AUCi')](_0x1a40fc,_0x31254b)}};$['get'](taskUrl(_0x4006ba['yuTwv']),(_0x42f8b4,_0x1dd5c2,_0x5bbfc6)=>{try{if(_0x42f8b4){console[_0x50e6('c4','QwV1')](_0x50e6('c5','nr6i')+JSON[_0x50e6('c6','9U4D')](_0x42f8b4))}else{_0x5bbfc6=JSON[_0x50e6('c7','toOG')](_0x5bbfc6);if(_0x14462c[_0x50e6('c8','G9L2')](_0x5bbfc6[_0x50e6('c9','nr6i')],null)){$[_0x50e6('ca','IlSe')]=_0x5bbfc6[_0x50e6('cb','!SNw')][_0x50e6('cc','IYWF')];$[_0x50e6('cd','nr6i')]=_0x5bbfc6['data'][_0x50e6('ce','Ltlb')];$['currentGrid']=_0x5bbfc6[_0x50e6('cf','f$^T')][_0x50e6('d0','Qw1i')]}else{console[_0x50e6('d1','utKN')](_0x5bbfc6[_0x50e6('d2','fjZ5')])}}}catch(_0x7117b0){$[_0x50e6('d3','btL@')](_0x7117b0)}finally{_0x599cd6()}})})}function postUrl(_0x2ee230,_0x10ede9){var _0xaaa60={'ypHwX':_0x50e6('d4',')ElN'),'ybcmP':_0x50e6('d5','G9L2'),'waNNX':'https://sendbeans.jd.com','vBRIO':'keep-alive','gnDvJ':'*/*','szhqH':_0x50e6('d6','nr6i'),'vwaRe':'https://sendbeans.jd.com/dist/taro/index.html/?lng=0.000000&lat=0.000000&sid=&un_area=','PXPmu':'zh-cn'};return{'url':''+ACT_API+_0x2ee230,'headers':{'Host':_0xaaa60[_0x50e6('d7','Gs#R')],'Content-Type':_0xaaa60['ybcmP'],'Origin':_0xaaa60[_0x50e6('d8','(o%5')],'Accept-Encoding':_0x50e6('d9','toOG'),'Cookie':cookie,'Connection':_0xaaa60['vBRIO'],'Accept':_0xaaa60[_0x50e6('da','tp$f')],'User-Agent':_0xaaa60['szhqH'],'Referer':_0xaaa60[_0x50e6('db','C#&r')],'Accept-Language':_0xaaa60[_0x50e6('dc','W*kL')]},'body':JSON[_0x50e6('dd','utKN')](_0x10ede9)}}function taskUrl(_0x1c2912,_0x48b4ab=''){var _0x5e448d={'hamvm':_0x50e6('de','C#&r'),'YdIsU':_0x50e6('df','Ql(U'),'ZOxrR':_0x50e6('e0','Ltlb'),'ETKme':'gzip,\x20deflate,\x20br'};return{'url':''+ACT_API+_0x1c2912+'?activityId=57'+_0x48b4ab,'headers':{'Host':'sendbeans.jd.com','Accept':_0x5e448d['hamvm'],'Connection':_0x5e448d[_0x50e6('e1','j]U&')],'Cookie':cookie,'User-Agent':_0x5e448d[_0x50e6('e2','nr6i')],'Accept-Language':_0x50e6('e3','IlSe'),'Referer':_0x50e6('e4','2GWc'),'Accept-Encoding':_0x5e448d[_0x50e6('e5','JSEi')]}}}function TotalBean(){var _0x83f411={'vvDxF':_0x50e6('e6','E!RB'),'VOBtD':function(_0x503abe){return _0x503abe()},'YrBly':_0x50e6('e7','^IPL'),'nnhaK':_0x50e6('e8','YGk^'),'mSYiA':'keep-alive','BetZw':_0x50e6('e9','BUl6'),'WbvOw':'JDUA'};return new Promise(async _0x3d4756=>{const _0x12da0a={'url':'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2','headers':{'Accept':_0x83f411['YrBly'],'Content-Type':_0x50e6('ea','WFWM'),'Accept-Encoding':_0x83f411[_0x50e6('eb','2^6E')],'Accept-Language':_0x50e6('ec','nr6i'),'Connection':_0x83f411[_0x50e6('ed','gw#x')],'Cookie':cookie,'Referer':'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2','User-Agent':$[_0x50e6('ee','BUl6')]()?process['env'][_0x50e6('ef','fg4v')]?process[_0x50e6('f0','WFWM')][_0x50e6('f1','gw#x')]:_0x83f411['BetZw']:$[_0x50e6('f2','IlSe')](_0x83f411[_0x50e6('f3','sJ*M')])?$[_0x50e6('f4','&X&u')](_0x83f411[_0x50e6('f5','Ltlb')]):_0x83f411['BetZw']}};$[_0x50e6('f6','qq69')](_0x12da0a,(_0x4d7640,_0x23e4b4,_0x43af94)=>{try{if(_0x4d7640){console['log'](''+JSON[_0x50e6('f7','56(D')](_0x4d7640));console[_0x50e6('f8','*T$B')]($[_0x50e6('10','j]U&')]+_0x50e6('f9','BUl6'))}else{if(_0x43af94){_0x43af94=JSON['parse'](_0x43af94);if(_0x43af94[_0x50e6('fa','Qw1i')]===0xd){$[_0x50e6('fb','BUl6')]=![];return}$['nickName']=_0x43af94[_0x83f411[_0x50e6('fc','2^6E')]][_0x50e6('fd','(o%5')]}else{console['log']('京东服务器返回空数据')}}}catch(_0x323e0a){$[_0x50e6('fe','7R0%')](_0x323e0a,_0x23e4b4)}finally{_0x83f411[_0x50e6('ff','btL@')](_0x3d4756)}})})};_0xodC='jsjiami.com.v6';

// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
