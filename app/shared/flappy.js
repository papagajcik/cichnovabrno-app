/* Čichnova Flappy – hra přímo v aplikaci (bez iframe). Běží ve Shadow DOM, takže nekoliduje se zbytkem stránky. */
(function(){
'use strict';
const host=document.createElement('div');host.id='flapHost';host.style.display='none';
const root=host.attachShadow({mode:'open'});
root.innerHTML="<style>\n:host{--orange:#ED6B06;--blue:#00A0DD;--cyan:#00C8D2;}\n*{box-sizing:border-box;}\n.glass{background:rgba(20,20,50,.95);border:1px solid rgba(255,255,255,.1);box-shadow:0 10px 40px rgba(0,0,0,.35);}\n\n#stage{position:fixed;inset:0;overflow:hidden;}\n.overlay{box-sizing:border-box;}\ncanvas#game{display:block;width:100vw;height:100vh;width:100dvw;height:100dvh;}\n\n/* horní lišta ve hře */\n#hud{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;pointer-events:none;zoom:var(--ui,1);}\n.hud-logo{background:#fff;border-radius:10px;padding:5px 7px;box-shadow:0 4px 12px rgba(0,0,0,.3);}\n.hud-logo img{height:40px;display:block;}\n.iconbtn{pointer-events:auto;width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(10,10,42,.6);color:#fff;font-size:21px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;}\n.iconbtn:active{transform:scale(.92);}\n.hud-right{display:flex;gap:8px;}\n\n/* překryvy */\n.overlay{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(5,5,20,.8);}\n.overlay.open{display:flex;animation:fade .25s ease;}\n@keyframes fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}\n.panel{width:calc(100% / var(--ui,1));max-width:520px;border-radius:22px;overflow:hidden;zoom:var(--ui,1);}\n.panel-top{background:linear-gradient(135deg,rgba(237,107,6,.92),rgba(0,160,221,.88));padding:20px 22px;}\n.eyebrow{font-weight:800;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.85);}\n.panel-top h1{margin:4px 0 0;font-size:32px;font-weight:900;color:#fff;line-height:1.1;}\n.panel-body{padding:18px 20px 20px;}\n.lbl{font-size:11.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#94a3b8;margin:0 0 10px;}\n.picker{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;max-height:270px;overflow-y:auto;padding:2px;margin-bottom:18px;}\n.ent{background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.08);border-radius:16px;padding:10px 6px 8px;cursor:pointer;color:inherit;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;transition:transform .12s,border-color .12s,background .12s;}\n.ent canvas{display:block;}\n.ent span{font-size:12.5px;font-weight:700;color:#cbd5e1;text-align:center;line-height:1.15;}\n.ent:active{transform:scale(.95);}\n.picker.single{display:flex;justify-content:center;max-height:none;overflow:visible;}\n.picker.single .ent{background:transparent;border-color:transparent;box-shadow:none;padding:0;cursor:default;}\n.picker.single .ent span{font-size:15px;font-weight:800;color:#fff;margin-top:4px;}\n.ent.sel{border-color:var(--orange);background:rgba(237,107,6,.16);box-shadow:0 6px 18px rgba(237,107,6,.3);}\n.modes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px;}\n.mbtn{font-family:inherit;color:#e2e8f0;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:14px;padding:10px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;font-weight:800;font-size:15px;}\n.mbtn small{font-size:10.5px;font-weight:700;color:#94a3b8;}\n.mbtn:active{transform:scale(.96);}\n.mbtn.sel{border-color:var(--orange);background:rgba(237,107,6,.18);box-shadow:0 6px 16px rgba(237,107,6,.3);color:#fff;}\n.mode-desc{text-align:center;font-size:12.5px;font-weight:600;color:#94a3b8;margin:0 0 16px;min-height:16px;}\n.btn{width:100%;font-family:inherit;font-weight:800;font-size:19px;padding:18px 20px;min-height:58px;border-radius:26px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--orange),#ff8c3d);color:#fff;box-shadow:0 8px 22px rgba(237,107,6,.4);}\n.btn:active{transform:scale(.97);}\n.btn.ghost{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);box-shadow:none;color:#e2e8f0;margin-top:10px;}\n.hint{text-align:center;font-size:12px;color:#64748b;margin-top:12px;}\n.scores{display:flex;gap:12px;margin-bottom:16px;}\n.sbox{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:12px;text-align:center;}\n.sbox small{display:block;font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#94a3b8;}\n.sbox b{font-size:40px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums;}\n.sbox.best b{color:var(--orange);}\n.newbest{display:none;text-align:center;font-weight:800;font-size:12px;color:#fff;background:linear-gradient(90deg,var(--orange),#d92b2b);border-radius:20px;padding:6px 12px;margin:-4px auto 14px;width:max-content;}\n.medal{text-align:center;font-size:13px;font-weight:700;color:#cbd5e1;margin:-4px 0 14px;min-height:18px;}\n\n/* žebříček + zápis skóre */\n.overlay{overflow-y:auto;touch-action:pan-y;}\n.panel{margin:auto;flex-shrink:0;}\n.btn2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;}\n.btn2 .btn{margin:0;font-size:16px;padding:14px 10px;min-height:52px;}\n.submit{margin:0 0 14px;}\n.srow{display:flex;gap:8px;}\n.srow input{flex:1;min-width:0;font:inherit;font-weight:700;font-size:16px;color:#fff;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 14px;outline:none;-webkit-user-select:text;user-select:text;}\n.srow input:focus{border-color:var(--cyan);}\n.srow input::placeholder{color:#64748b;}\n.srow .btn{width:auto;padding:0 20px;min-height:50px;font-size:16px;border-radius:14px;}\n.srow .btn:disabled{opacity:.5;}\n.smsg{font-size:13px;font-weight:700;margin-top:8px;min-height:16px;text-align:center;color:#94a3b8;}\n.smsg.err{color:#fca5a5;}\n.smsg.ok{color:#fff;font-size:14px;margin:0 0 10px;}\n.lb{margin:0 0 14px;min-height:60px;}\n.lbrow{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid transparent;margin-bottom:6px;font-weight:700;}\n.lbrow .rk{width:32px;text-align:center;font-weight:900;color:#94a3b8;font-variant-numeric:tabular-nums;}\n.lbrow .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e2e8f0;}\n.lbrow .sc{font-weight:900;color:#fff;font-variant-numeric:tabular-nums;}\n.lbrow.me{background:rgba(237,107,6,.22);border-color:var(--orange);}\n.lbgap{text-align:center;color:#64748b;font-weight:800;line-height:1;margin:-2px 0 4px;}\n#o-board{min-height:0;margin:10px 0 0;}\n#o-board:empty{display:none;}\n.smsg:empty{display:none;}\n.lbempty{text-align:center;color:#94a3b8;font-size:13px;font-weight:600;padding:22px 0;}\n\n:host{all:initial;position:fixed;inset:0;z-index:100;display:none;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;--orange:#ED6B06;--blue:#00A0DD;--cyan:#00C8D2}\n#stage{background:radial-gradient(ellipse at 20% 30%,rgba(237,107,6,.28) 0%,transparent 50%),radial-gradient(ellipse at 80% 60%,rgba(0,160,221,.28) 0%,transparent 50%),linear-gradient(135deg,#0a0a2a 0%,#1a1a3a 100%);-webkit-user-select:none;user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent}\ninput{-webkit-user-select:text;user-select:text}\nbutton{font-family:inherit}\n</style>"+"<div id=\"stage\">\n  <canvas id=\"game\"></canvas>\n\n  <div id=\"hud\">\n    <div class=\"hud-logo\"><img src=\"data:image/webp;base64,UklGRtgOAABXRUJQVlA4WAoAAAAQAAAAyQAAbwAAQUxQSE8KAAAB8EBs2+5W27bthmGIISIiqiKiKqqqaqqqip5/UVNVVVRVz7+oqaJiqvlTVXOeZ6nzp6oqzp+qqqmqYoqhaqo6fyKiqs6fqqqIqqioqoiIiIiIGHaSMUaO40g65nn9iggJbhtJkiTvfVZOZjkcGfMC+M+jDG7Le4PRbHTU8H7AEkXM7z7i3gf4y4iId8t2/af9ChWSL70mnYdfk1Gl0pFb0HX606il7GYnp9+IIayjm/kW3Wa8WA+s/DEh6jPWUyRQcX+A12OeVZBI6bV2/aUjgYSSr/wWvf0vfkBylfU2OA1mKNDb4GQ8QArpbXCaLFKgt8Gp9S+kkM4GJ26hQoHeBqeuJJJLb4OTsIkU0tvg5M5SoKvBibO6XlwihfQzOJl6pndjeaSRTgYnQ7sncJqRkU56GJz41o9f/XJXpvoIKauB7gUnc99s6Io6Smz6YjKivgUnsXNy8zyH9Lp2guO7ewb/x8WDDU6Cffi7aKrCpljNAQDXGyzoUnDirK5n725KyEonVqUXjR1X9CY4mXq8O5dMPb7g0bhSeHqtI8HJ0D62zt7jQ5o5yLmeZhOcHobH35aRvbx1Ht61X3zowcncS+/x5eThXomMQF2fnfirwiQ4NbHHn2UpjTt1vDriMO0hGaf1Pb1l4YZNcHqIHp+72P6sywgAowVCMt0Eltu5mWURnEYMTeXxA88OaD2+eC35+y2catxEvK9eoo1xH5UeTnAyddN7fOUuvOS28drjJlLtcGTr8l6wCU4PwOPlzB8/jDvrHLu2KyTm0gpksi3dsQhOU2Jze3whvvfkkYlk3ERxPAeI35qenXzzVgJzr+8tA4+fH2zhCMdNFHpKceiGI2UGlWCdfSUQOyY3zrIyrcevjDgE8nETDfs8zZ754nLTVYLHkXtajz/fqno8zbipQEXCBjRqW0k1Wys7Wqb1+D4Lx3zchLGM+rndlI7Q/5ZBn1HYY1kJ2m4pPb4h46bcWBhVWqJ+oTwnDILT/Td2Zhh+ofD4ho2btoVlNb/RP7t1LoEM7uKnmbWyr+ofpNjukx5TI8dNt90wVFKXVha25/whw6CVXWDFx0XNZ02+q3l8Y8dN8isO7OoNLnuYbMPgQZH6N3uZTSiuNByi5vGNHzed2wD4fVRpndHzT51RFp9vmG0pr1GJAk0xbip9AQAwp9VRsNrFxSQNlw5gplmNmwsjOQLDcdOh4tkH8uqA0A2MxHVv5ch/fxrY0ZejX64juDE71GHhWYybsh8rrfBSfSK/AGYShn4pEXJkYojlnH65HxYRS6mLd6vewTYTRzdu2lB+lLkdVOkNx7KPeZIiIusGhnBb9Mt9olUa7v4KLU30242k46abTlDKK6u4sAJDdd+R7Qlb75vSWK6FlPW6Jpa7Od4N5IjyyDynokddF/L9DBG2SfeEKV0p2uUKR8hKf7RonNA/NDoKlhmabE9ecGwxHtMu1xpjRXECNBRQI/HMMIeRhFPmF6KrtMvtSrNiX9TsMtSGem1jxkyZhMI4sGakTNnIDJcZkXZpx7g7jY6CFY4Y4UUwc9qS6uUOkTGHjAjw2tFe44x+xcq4V2QSUn3AHOGIspHZZsS1E7S1pNVRMIoFKSRA/o4D9lpQEyZarhhBVuOmOgwVWXYUAIa3SELMAQ3gw4J6uU6iXJdgNW6qg2ZHMcYET4GE8hPQhnlHURknoTfHatykDfOOwnqCJPxmbgicxqH6gWifKkx4S/A6PNWoRUYGzJFdQwxBY+TTiAcmBm05IgN3Y95ROMnem02hQfSqpxCZHoJzEmSBvFKnlNfvKBpzDZHsggZhPlMvd7o+plMWxNuI3pQ3Gpc8XCOuISoLHDRKGr3BLkdwEceA8iwQyasV7Wnj5jvSENwwJivq4mGti6vAgAihu3WrtzjXT8lnJcIQ3Dg6NToKV12+QHryw1CD5nXwU1aeMyRBEhuIGEWVXtRlhQG7BurGUOJp4F7JJKQHoJEaW1bJU5fxZU2tbdTTT98sL3/VAaQ8WlI9rY8q8hlmlkn0GQ///pTZbgaDvYV7H+A6jQz+dDXLvw/ghq4ymRcGeD+od94j1DNokWOAwdAsCCLXPBinQsfhwCMO4ItgwAzAuzYi0aDHADAk7bQDgGldmgXnruTjAOCZtCoC8B9vRcIbLh5sW9IiDwCmgLRmBLBuSH5OjW1bkkJvvurlAAYkSQpt+p0AMLfXo9iA5W8MVdqXfonuDAnN8ifflFBGvPUA/ICJVuBm0ijLWFgVwYe5PuX94Q7055QTrhCem4F/lkVZxrSPM0YwYa8ykMMtDsBTwlirRg5LX0vSYfJuDGACTyUpkom7AIJ4YAIA8fjECNB7fn+we5GZ55sCbrFS3JrwX+JVuxJXSj6entqvFKfqgyFRxXBWPpr6LCynP4Rncnm0yjyWRgD4PcTyhBZrAHxfImqECXkMQBxNHYlVSj41lt/igzy0bmQeNwX2BG4bANx5eVYBt4NX7QDWP/DQUJ/ilBLDEZ7ZANpiGBJ60vgDgOE3jLUAOG8raQwJ2gD37roFJipjAMBLd20QzF4mulSMFWYUa49LQjMwVFJcwRifLj1WYI3hGwAAz9KsWJcsntsVdKZwWRlUk22GIzy3QGcKAxzArHzzqnLfWYe2+G+iCi5464BgcjK1JypZv+9QtoaJ1mbAq/WJRwra77UuEX1YDkuS9C6vJJCUv+FrfFjEScWFMub6YVbOu2BaLroBxDDuOZPynAZhv3/xOP4xKH8iuO9ChiqOpfwXCjhJ9elbS5muZmAOc73adGdwgeC2RInvRSU1UGO4LHuUDVTxQ+i8x0U+iGcWgP5sZZIPYtSoJhOPJwqRLtUf+eXu5BFUsbUcx501hF/OzArmc33NwAzm+7XpSOFXWhRX/X7/wr2SGUsUD46U30yrvukDYR/DHQn8DgC+wbte66ycc6nZsFptjy8jFpiQq9wmOkEBuDNblto3B5cW1TfdzcBwuTxS+2Wv36WgJY5biumQf7L+H5mBx7lSrkpXGtdqrGHSAeCtpBZK+UEA6zmWruJJGdc4zV+G2cKg8pen89Mq+JWct/bLP907FbxJ2puB9iT+xAMM5nFOAf8WL+0Alj8wTIKwgVjFGFE8m+MSDwSA9lv5VjH+HylhIZ/P10qZNr7ysBJL9MKmBGx/XCWqjBe9NWyxQ6EZ4Nfk/PqY9w9Mdinr2OOcfDjl2SmXfUAAOK9rgKcgH3o+C8v5UQDgg4j4CoDfweTIwMDAfKU8rlnHnNHbDtVfG88vcEpgJIdVrMexfg7Mq7lxaAq1HlSwIuPtFKdEWMyjXMFCwEgE+Mo1hFfZ2rNmFgXV7VC2T3Gq9ngAcNxgkNfKFonsHKfCeHjToUIIyCdGANdFcnvtOLvSLNnRMnNw8ss3PRzAtPSTGUAY2o5Gt0ZEgrznrmJeU+a9Dzcjkc1BXrkHW9KKCND3NuRWnK4F6QeLOu9J0k9DAsBASGGKg8FRmNtQ+KR9S5H3HM8OIrueJmoAeGO914MTH1QG50UO/o+/AABWUDggYgQAAJAaAJ0BKsoAcAA+bTaXSKQioiEjkamQgA2JTdwYAAzFIBeIHe9XY5r+UnNYbeeAPUBpO3h353/s/7H+XPuA/gHsA+2D3AP0V/0P9M6wHmA/X79zve6/AD3AegB/Q/+B6qfqAegB5qf+q/aT/6/Ir+2H7VfAj+zf/s6wDqZMgCxph0V4pA72CZZasLZ4ftmRmWjjgO6TT38upwhO2OlQzhQqchdocD+zBGWIanPX07rPvKJr6T73ctgnOFUMNtvBXIBbnMF9HdEx0NDQ+NZvN9MLIlTKMa/ph3LmN9EYAP7cLBNjT/8nL3t8MT16wA9UL+TpCf+ATlaze5D4AVr4wHI/VmGRdG/yx1UH/4YzJ2bJQjXBXqQ9d0R6sySu/p+Sse4AI31dzkRpWBWoK6c1vR1pj9BRM/g9iA7f+nEtFLEnh6+N5pxUo3zf2cmMyX8WqLKVl4D1UDKNs3OqEGqyifiWXU3wss5fmj9eGnR3CTyK4LIitP3AMtSAWBq3hmv/BVV2nJ6J/yusWSR/mQ/BX/xvKne+sEThW3gS2AZ/wXquiG+63o00uuGedrLf4Z6s/noB9/iVfz+gv5X4JRbAROqG8mxpMgG29vNN7YXLjv8etAJiB67MhvyC1AsHwmjdWo9GtFCGM7PQi/+QEnS2WCYEKr5Phbjt8skswHZFZfzi1CmVOGO+PgVvcypGs3zGJj6eH3pp7u2lfPYhoOqPH2PdZrSgzNDYgyBPz1nT0K42qWI540yrT1kJWoBjAe6s/3nvwlV7YoG9aGP5llfpcdpuN+qP//9ZbecdpoWD6T/YxNLxdqOgLjme+td6SHbYBGJoUsqRObmcFVq8Ug2rLcICWfO6sDJjpU2+Vmp1CgmJQ+ALPHlh7D12pSylgRXnnTT/YpAB//447TaKRDsW2njlMin6FVNlh5/bOYVPUP9ccTQsHkk+/Mes753mvrFinbJldYUBxWXBjvsLqU2Cz8ky2rdQFyzu0MOp1U9PiC9jL9b/k7gR4Ty5qtNOoTNZ6AZhNWHdgUdbgk1k68tJFzdO3RnvnLodBIJV+jBJJ8bM7OBmnWwmTC5jvMhiAnuGz5FVDeAV0wQU33FH6bmhv506Sq+0eR30U3JfKE5HbEN3HQPWqQLgsZ9kGP0keVJoXrl8kb1ry0AwN/M/qE7fRTtblJbKzigR5joCn032+EjeHxrvRePQi6cI9m3t68dYZKsAlQaibhFDdp++wXxfDSYIcDTUVBA1V/GrjScwgSAbBxVqquI2M//3Fngp5Kbqp3OYyJjFKABx4iwrd9UHo33RJSfh0xm5moyZKulUEyrgA3iJlTuCls3XLdaDfL3k+7TFELMFNsChL2mb7z6Xcl7HxPOdnytXMhQfEpl5FMmE2+RbayUo7JWRABuHGKEroqB/YHT9PAX8jNHws+IDCDnDFik9t7qZYfb6urCq7W9alN+e4a7l6oRDbrlmW91f/CfNuzU9rd8AAAAAAAAAAAAAAA==\" alt=\"Čichnova Brno\"></div>\n    <div class=\"hud-right\">\n      <button class=\"iconbtn\" id=\"btn-sound\" title=\"Zvuk\">🔊</button>\n      <button class=\"iconbtn\" id=\"btn-menu\" title=\"Menu\">☰</button>\n      <button class=\"iconbtn\" id=\"btn-exit\" title=\"Zavřít hru\" style=\"display:none\">✕</button>\n    </div>\n  </div>\n\n  <!-- MENU -->\n  <div class=\"overlay open\" id=\"ov-menu\">\n    <div class=\"panel glass\">\n      <div class=\"panel-top\">\n        <div class=\"eyebrow\">SŠ a VOŠ informatiky a financí Brno</div>\n        <h1>Čichnova Flappy</h1>\n      </div>\n      <div class=\"panel-body\">\n        <p class=\"lbl\" id=\"pick-lbl\">Vyber si postavu</p>\n        <div class=\"picker\" id=\"picker\"></div>\n        <p class=\"lbl\">Obtížnost</p>\n        <div class=\"modes\" id=\"modes\"></div>\n        <div class=\"mode-desc\" id=\"mode-desc\"></div>\n        <button class=\"btn\" id=\"btn-start\">Hrát</button>\n        <button class=\"btn ghost\" id=\"btn-board\">🏆 Žebříček</button>\n        <button class=\"btn ghost\" id=\"btn-exit2\" style=\"display:none\">Zpět na kiosek</button>\n      </div>\n    </div>\n  </div>\n\n  <!-- GAME OVER -->\n  <div class=\"overlay\" id=\"ov-over\">\n    <div class=\"panel glass\">\n      <div class=\"panel-top\"><div class=\"eyebrow\">Konec hry · <span id=\"o-mode\"></span></div><h1>Auu! 💥</h1></div>\n      <div class=\"panel-body\">\n        <div class=\"scores\">\n          <div class=\"sbox\"><small>Skóre</small><b id=\"o-score\">0</b></div>\n          <div class=\"sbox best\"><small>Rekord</small><b id=\"o-best\">0</b></div>\n        </div>\n        <div class=\"newbest\" id=\"o-new\">🏆 Nový rekord!</div>\n        <div class=\"medal\" id=\"o-medal\"></div>\n        <div class=\"submit\" id=\"o-submit\" style=\"display:none\">\n          <div id=\"o-form\">\n            <p class=\"lbl\">Zapiš se do žebříčku</p>\n            <div class=\"srow\">\n              <input id=\"o-name\" type=\"text\" maxlength=\"20\" placeholder=\"Tvoje herní jméno\" autocomplete=\"off\" autocapitalize=\"words\" spellcheck=\"false\" enterkeyhint=\"done\">\n              <button class=\"btn\" id=\"btn-save\">Zapsat</button>\n            </div>\n          </div>\n          <div class=\"smsg\" id=\"o-msg\"></div>\n          <div class=\"lb\" id=\"o-board\"></div>\n        </div>\n        <button class=\"btn\" id=\"btn-retry\">Znovu</button>\n        <div class=\"btn2\">\n          <button class=\"btn ghost\" id=\"btn-board2\">🏆 Žebříček</button>\n          <button class=\"btn ghost\" id=\"btn-change\">Hlavní nabídka</button>\n        </div>\n      </div>\n    </div>\n  </div>\n  <!-- ŽEBŘÍČEK -->\n  <div class=\"overlay\" id=\"ov-board\">\n    <div class=\"panel glass\">\n      <div class=\"panel-top\"><div class=\"eyebrow\">Čichnova Flappy</div><h1>Žebříček 🏆</h1></div>\n      <div class=\"panel-body\">\n        <div class=\"modes\" id=\"lb-tabs\"></div>\n        <div class=\"lb\" id=\"lb-list\"></div>\n        <button class=\"btn ghost\" id=\"btn-board-close\" style=\"margin-top:0\">Zavřít</button>\n      </div>\n    </div>\n  </div>\n</div>";
document.body.appendChild(host);

/* =====================================================================
   ENTITY – postavy spravuje administrace (cichnovabrno/admin → Flappy → Herní postavy).
   Tady je jen záložní pták pro případ, že se seznam nepodaří načíst.
   ===================================================================== */
const FALLBACK_ENT = { id:'default', name:'Pták', color:'#00A0DD' };   // použije se, dokud se postavy nenačtou (nebo když žádné nejsou)
const ENTITIES = [FALLBACK_ENT];   // postavy se načítají z administrace (Flappy → Herní postavy)

/* ---------- ladění hry ---------- */
const H = 700, GROUND = 70; let W = 420;
const PIPE_W = 72;
let BIRD_X = 140; const BIRD_R = 21;   // BIRD_R = poloměr hitboxu

/* ---------- HERNÍ REŽIMY ----------
   gravity/flap = fyzika skoku, gap = mezera mezi trubkami, dist = vzdálenost trubek,
   speed0/speedMax/ramp = rychlost (roste s každým bodem), hit = velikost hitboxu (1 = výchozí),
   medals = body pro bronz / stříbro / zlato */
const MODES = {
  easy:    { name:'Easy',    icon:'🟢', desc:'Pomalejší a odpouštějící',
             gravity:1150, flap:-390, gap:250, dist:290, speed0:115, speedMax:175, ramp:1.2, hit:.7,  medals:[10,20,30] },
  classic: { name:'Classic', icon:'🟠', desc:'Původní obtížnost',
             gravity:1500, flap:-430, gap:175, dist:235, speed0:150, speedMax:260, ramp:3,   hit:.9,  medals:[10,20,30] },
  hard:    { name:'Hard',    icon:'🔴', desc:'Úzké mezery, vysoká rychlost',
             gravity:1650, flap:-450, gap:150, dist:220, speed0:175, speedMax:310, ramp:3.5, hit:.95, medals:[5,15,25] }
};
let modeId = store_get('flappy_mode','easy'); if(!MODES[modeId]) modeId='easy';
let M = MODES[modeId];
function store_get(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }

/* ---------- pomocné ---------- */
const $ = id => root.getElementById(id);
const store = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};
const canvas = $('game'), ctx = canvas.getContext('2d');
const stage = $('stage');

function fit(){
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  const vw = Math.max(innerWidth,1), vh = Math.max(innerHeight,1);
  W = Math.max(320, Math.round(H*vw/vh));   // výška je pevná (celá obrazovka), šířka se přizpůsobí obrazovce
  BIRD_X = Math.max(120, Math.min(320, Math.round(W*0.25)));
  canvas.width = Math.floor(vw*dpr); canvas.height = Math.floor(vh*dpr);
  const k = canvas.height/H;                                // stejné měřítko ve směru x i y
  ctx.setTransform(k,0,0,k,0,0);
  host.style.setProperty('--ui', Math.max(1, Math.min(2, vh/760, vw/560)).toFixed(2));   // větší menu a tlačítka na velké obrazovce
  if(typeof dots!=='undefined') dots.forEach(d=>{ if(d.x>W) d.x=Math.random()*W; });
}
addEventListener('resize', fit);
addEventListener('orientationchange', ()=>setTimeout(fit,200));

/* ---------- obrázky entit ---------- */
function initEntityImg(e){
  if(e.img && !e._im){ e._im = new Image(); e._im.onload=()=>{e._ok=true; renderPicker();}; e._im.onerror=()=>{e._ok=false;}; e._im.src=e.img; }
}
ENTITIES.forEach(initEntityImg);

function drawEntity(c, e, x, y, r, angle=0, flapPhase=0){
  c.save(); c.translate(x,y); c.rotate(angle);
  if(e._ok){
    const im=e._im, k=(r*(e.scale||2.7))/Math.max(im.width,im.height);
    c.drawImage(im, -im.width*k/2, -im.height*k/2, im.width*k, im.height*k);
  } else {
    const col=e.color||'#00A0DD', R=r*1.2;   // záložní barva, když postava nemá color
    // křídlo
    c.fillStyle='rgba(255,255,255,.85)';
    c.beginPath(); c.ellipse(-R*.35, R*.15 + Math.sin(flapPhase)*R*.18, R*.5, R*.3, -.4, 0, Math.PI*2); c.fill();
    // tělo
    const g=c.createRadialGradient(-R*.3,-R*.4,R*.1,0,0,R);
    g.addColorStop(0,'#fff'); g.addColorStop(.25,col); g.addColorStop(1,shade(col,-.35));
    c.fillStyle=g; c.beginPath(); c.arc(0,0,R,0,Math.PI*2); c.fill();
    c.lineWidth=2; c.strokeStyle='rgba(10,10,42,.55)'; c.stroke();
    // oko
    c.fillStyle='#fff'; c.beginPath(); c.arc(R*.35,-R*.25,R*.3,0,Math.PI*2); c.fill();
    c.fillStyle='#0a0a2a'; c.beginPath(); c.arc(R*.45,-R*.25,R*.14,0,Math.PI*2); c.fill();
    // zobák
    c.fillStyle='#ED6B06'; c.beginPath(); c.moveTo(R*.75,0); c.lineTo(R*1.35,R*.12); c.lineTo(R*.75,R*.4); c.closePath(); c.fill();
  }
  c.restore();
}
function shade(hex,p){
  const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255;
  const f=p<0?0:255, t=Math.abs(p);
  r=Math.round((f-r)*t+r); g=Math.round((f-g)*t+g); b=Math.round((f-b)*t+b);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

/* ---------- výběr postavy ---------- */
let selected = ENTITIES.find(e=>e.id===store.get('flappy_ent','')) || ENTITIES[0];
function renderPicker(){
  const p=$('picker'); p.innerHTML='';
  const single = ENTITIES.length===1;
  $('pick-lbl').style.display = single?'none':'block';
  p.classList.toggle('single',single);
  const sz = single?150:(ENTITIES.length<=4?88:62);
  ENTITIES.forEach(e=>{
    const b=document.createElement('button'); b.className='ent'+(e===selected?' sel':'');
    const cv=document.createElement('canvas'); cv.width=sz*2; cv.height=sz*2; cv.style.width=cv.style.height=sz+'px';
    const c=cv.getContext('2d'); c.scale(2,2);
    const r = e._ok ? (sz-6)/(e.scale||2.7) : sz*.3;
    drawEntity(c,e,sz/2,sz/2,r,single?-.12:0,0);
    const s=document.createElement('span'); s.textContent=e.name;
    b.append(cv,s);
    b.onclick=()=>{ selected=e; store.set('flappy_ent',e.id); renderPicker(); };
    p.appendChild(b);
  });
}
renderPicker();

let lbData=null, lbState='loading';   // žebříček (načítá se z api.php)
function renderModes(){
  const box=$('modes'); box.innerHTML='';
  Object.keys(MODES).forEach(id=>{
    const m=MODES[id], b=document.createElement('button');
    b.className='mbtn'+(id===modeId?' sel':'');
    let bst = store.get('flappy_best_'+id, id==='classic'?store.get('flappy_best','0'):'0');
    b.innerHTML='<span>'+m.icon+' '+m.name+'</span><small>🏆 '+(parseInt(bst)||0)+'</small>';
    b.onclick=e=>{ e.stopPropagation(); setMode(id); };
    box.appendChild(b);
  });
  const top1 = lbData && lbData[modeId] && lbData[modeId][0];
  $('mode-desc').textContent = M.desc + (top1 ? '  ·  👑 '+top1.name+' '+top1.score : '');
}
function setMode(id){
  modeId=id; M=MODES[id]; store.set('flappy_mode',id); loadBest(); renderModes();
}
renderModes();

/* ---------- zvuk ---------- */
let muted = store.get('flappy_mute','0')==='1', actx=null;
function beep(f,d,type='sine',vol=.08,slide=0){
  if(muted) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(), g=actx.createGain();
    o.type=type; o.frequency.value=f; if(slide) o.frequency.linearRampToValueAtTime(f+slide, actx.currentTime+d);
    g.gain.setValueAtTime(vol,actx.currentTime); g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+d);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime+d);
  }catch(e){}
}
function updSound(){ $('btn-sound').textContent = muted?'🔇':'🔊'; }
$('btn-sound').onclick=e=>{ e.stopPropagation(); muted=!muted; store.set('flappy_mute',muted?'1':'0'); updSound(); };
updSound();

/* ---------- stav hry ---------- */
let state='menu';            // menu | ready | play | over
let bird, pipes, score, best = 0;
function loadBest(){
  let v = store.get('flappy_best_'+modeId, null);
  if(v===null && modeId==='classic') v = store.get('flappy_best','0');   // starý rekord patří do Classic
  best = parseInt(v)||0;
}
loadBest();
let speed, dist, t=0, lockUntil=0, shake=0, flash=0;
const dots = Array.from({length:70},()=>({x:Math.random()*W,y:Math.random()*(H-GROUND),r:Math.random()*1.8+.6,s:Math.random()*12+6}));

fit();
function reset(){
  bird={y:H*0.42,vy:0,rot:0,ph:0};
  pipes=[]; score=0; speed=M.speed0; dist=0; shake=0; flash=0;
  spawnPipe(Math.max(W+120, BIRD_X+420));
}
function spawnPipe(x){
  // gy = STŘED mezery → okraje 90 px od stropu a od země
  const min=90+M.gap/2, max=H-GROUND-90-M.gap/2;
  pipes.push({x, gy:min+Math.random()*(max-min), passed:false});
}
function flap(){
  const now=performance.now();
  if(state==='ready'){ state='play'; }
  if(state==='play'){ bird.vy=M.flap; beep(520,.12,'square',.05,260); }
  else if(state==='over' && now>lockUntil && !$('ov-over').classList.contains('open')){ /* čeká na overlay */ }
}
function die(){
  if(state!=='play') return;
  state='over'; shake=.35; flash=.25; lockUntil=performance.now()+500;
  beep(180,.35,'sawtooth',.09,-120);
  const isNew = score>best;
  if(isNew){ best=score; store.set('flappy_best_'+modeId,String(best)); }
  setTimeout(()=>{
    $('o-score').textContent=score; $('o-best').textContent=best;
    $('o-new').style.display=(isNew&&score>0)?'block':'none';
    const md=M.medals;
    $('o-mode').textContent = M.icon+' '+M.name;
    $('o-medal').textContent = score>=md[2]?'🥇 Zlatá medaile':score>=md[1]?'🥈 Stříbrná medaile':score>=md[0]?'🥉 Bronzová medaile':'Zkus to znovu, dáš to!';
    prepSubmit();
    $('ov-over').classList.add('open');
  },650);
}

/* ---------- napojení na kiosek (hra běží v iframe) ---------- */
const framed = false;   // hra běží přímo v aplikaci (osobní telefon), jméno se pamatuje
let OPEN = false;
function closeGame(){ OPEN=false; host.style.display='none'; }
$('btn-exit').style.display='flex'; $('btn-exit2').style.display='block'; $('btn-exit2').textContent='Zpět do aplikace';
$('btn-exit').onclick=e=>{ e.stopPropagation(); closeGame(); };
$('btn-exit2').onclick=e=>{ e.stopPropagation(); closeGame(); };

/* ---------- ovládání ---------- */
function startGame(){ $('ov-menu').classList.remove('open'); $('ov-over').classList.remove('open'); $('ov-board').classList.remove('open'); reset(); newRun(); state='ready'; }
$('btn-start').onclick=e=>{ e.stopPropagation(); startGame(); };
$('btn-retry').onclick=e=>{ e.stopPropagation(); startGame(); };
$('btn-change').onclick=e=>{ e.stopPropagation(); $('ov-over').classList.remove('open'); $('ov-menu').classList.add('open'); state='menu'; reset(); };
$('btn-menu').onclick=e=>{ e.stopPropagation(); $('ov-over').classList.remove('open'); $('ov-menu').classList.add('open'); state='menu'; reset(); };
stage.addEventListener('pointerdown',e=>{ if(e.target.closest('.overlay,.iconbtn')) return; e.preventDefault(); flap(); });
['contextmenu','dblclick','selectstart','dragstart'].forEach(n=>stage.addEventListener(n,e=>{ if(e.target && e.target.tagName==='INPUT') return; e.preventDefault(); }));
/* klávesnice (mimo kiosek): mezerník / ↑ / W = skok, v menu a po konci hry = hrát znovu */
addEventListener('keydown',e=>{
  if(!OPEN) return;
  if(e.key==='Escape'){ closeGame(); return; }
  const tg = e.composedPath ? e.composedPath()[0] : e.target;
  if(tg && tg.tagName==='INPUT') return;   // psaní jména do žebříčku
  if(e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  if(!(e.code==='Space' || e.code==='ArrowUp' || e.code==='KeyW')) return;
  e.preventDefault();
  if(root.activeElement && root.activeElement.blur) root.activeElement.blur();   // aby mezerník neklikl na zaostřené tlačítko
  lastInput=performance.now();
  if(state==='menu') startGame();
  else if(state==='over'){ if(performance.now()>lockUntil && $('ov-over').classList.contains('open')) startGame(); }
  else flap();
});
let lastInput=performance.now();
stage.addEventListener('pointerdown',()=>{ lastInput=performance.now(); },true);

/* ---------- update ---------- */
function update(dt){
  t+=dt;
  dots.forEach(d=>{ d.x-=d.s*dt*(state==='play'?2.5:1); if(d.x<-4){ d.x=W+4; d.y=Math.random()*(H-GROUND);} });

  if(state==='menu'||state==='ready'){
    bird.y = H*0.42 + Math.sin(t*4)*8; bird.rot=0; bird.ph+=dt*14; return;
  }
  // pták
  bird.vy += M.gravity*dt; bird.y += bird.vy*dt;
  bird.rot = Math.max(-.45, Math.min(1.25, bird.vy/650));
  bird.ph += dt*(state==='play'?22:0);
  if(bird.y-BIRD_R<0){ bird.y=BIRD_R; bird.vy=Math.max(bird.vy,0); }
  const floorY=H-GROUND;
  if(bird.y+BIRD_R>=floorY){ bird.y=floorY-BIRD_R; die(); bird.vy=0; bird.rot=1.3; }

  if(state==='play'){
    speed=Math.min(M.speedMax, M.speed0+score*M.ramp);
    pipes.forEach(p=>p.x-=speed*dt);
    const last=pipes[pipes.length-1];
    if(last.x < W+40) spawnPipe(last.x+M.dist);
    if(pipes[0].x+PIPE_W<-10) pipes.shift();
    dist+=speed*dt;
    for(const p of pipes){
      if(!p.passed && p.x+PIPE_W<BIRD_X-BIRD_R){ p.passed=true; score++; beep(880,.1,'triangle',.07,240); }
      if(circleRect(BIRD_X,bird.y,BIRD_R*M.hit,p.x,0,PIPE_W,p.gy-M.gap/2) ||
         circleRect(BIRD_X,bird.y,BIRD_R*M.hit,p.x,p.gy+M.gap/2,PIPE_W,H-GROUND-(p.gy+M.gap/2))) { die(); break; }
    }
  }
  if(shake>0) shake-=dt; if(flash>0) flash-=dt;
}
function circleRect(cx,cy,r,rx,ry,rw,rh){
  const nx=Math.max(rx,Math.min(cx,rx+rw)), ny=Math.max(ry,Math.min(cy,ry+rh));
  const dx=cx-nx, dy=cy-ny; return dx*dx+dy*dy<r*r;
}

/* ---------- vykreslení ---------- */
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x,y,w,h,r) : ctx.rect(x,y,w,h); }
function drawPipe(x,y,w,h,isTop){
  if(h<=0) return;
  const g=ctx.createLinearGradient(x,0,x+w,0);
  g.addColorStop(0,'#b94f03'); g.addColorStop(.3,'#ff8c3d'); g.addColorStop(.6,'#ED6B06'); g.addColorStop(1,'#9a4103');
  ctx.fillStyle=g; ctx.fillRect(x+4,y,w-8,h);
  // čepička
  const ch=26, cy=isTop?y+h-ch:y;
  ctx.fillStyle=g; rr(x-3,cy,w+6,ch,8); ctx.fill();
  ctx.lineWidth=2; ctx.strokeStyle='rgba(10,10,42,.55)'; ctx.stroke();
  // modro-cyan svítící okraj
  ctx.fillStyle='rgba(0,200,210,.9)';
  ctx.fillRect(isTop?x+4:x+4, isTop?y+h-ch-3:y+ch, w-8, 3);
}
function render(){
  ctx.save();
  if(shake>0){ ctx.translate((Math.random()-.5)*10*shake/.35,(Math.random()-.5)*10*shake/.35); }
  // pozadí
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0a0a2a'); bg.addColorStop(.6,'#151a42'); bg.addColorStop(1,'#1c2a5a');
  ctx.fillStyle=bg; ctx.fillRect(-20,-20,W+40,H+40);
  glow(W*.2,H*.28,260,'rgba(237,107,6,.30)'); glow(W*.85,H*.6,280,'rgba(0,160,221,.30)'); glow(W*.5,H*.9,260,'rgba(0,200,210,.20)');
  ctx.fillStyle='rgba(255,255,255,.35)'; dots.forEach(d=>{ ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill(); });

  // trubky
  pipes.forEach(p=>{
    drawPipe(p.x,0,PIPE_W,p.gy-M.gap/2,true);
    drawPipe(p.x,p.gy+M.gap/2,PIPE_W,H-GROUND-(p.gy+M.gap/2),false);
  });

  // zem
  const gy=H-GROUND;
  ctx.fillStyle='#0a0a2a'; ctx.fillRect(0,gy,W,GROUND);
  const off = (state==='over'?dist:dist)%40;
  ctx.save(); ctx.beginPath(); ctx.rect(0,gy,W,GROUND); ctx.clip();
  for(let x=-40-off;x<W+40;x+=40){
    ctx.fillStyle='rgba(237,107,6,.85)'; ctx.beginPath(); ctx.moveTo(x,gy+6); ctx.lineTo(x+20,gy+6); ctx.lineTo(x+8,gy+22); ctx.lineTo(x-12,gy+22); ctx.fill();
    ctx.fillStyle='rgba(0,160,221,.55)'; ctx.beginPath(); ctx.moveTo(x+20,gy+6); ctx.lineTo(x+40,gy+6); ctx.lineTo(x+28,gy+22); ctx.lineTo(x+8,gy+22); ctx.fill();
  }
  ctx.restore();
  const eg=ctx.createLinearGradient(0,0,W,0); eg.addColorStop(0,'#ED6B06'); eg.addColorStop(.5,'#00A0DD'); eg.addColorStop(1,'#00C8D2');
  ctx.fillStyle=eg; ctx.fillRect(0,gy,W,4);

  // pták
  if(bird) drawEntity(ctx,selected,BIRD_X,bird.y,BIRD_R,bird.rot,bird.ph);

  // skóre
  if(state==='play'||state==='over'){
    ctx.textAlign='center'; ctx.font='900 64px Inter, sans-serif';
    ctx.lineWidth=8; ctx.strokeStyle='rgba(10,10,42,.8)'; ctx.strokeText(score,W/2,120);
    ctx.fillStyle='#fff'; ctx.fillText(score,W/2,120);
  }
  if(state==='ready'){
    ctx.textAlign='center';
    ctx.fillStyle='rgba(20,20,50,.65)'; rr(W/2-130,H*.58,260,74,18); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='800 20px Inter, sans-serif'; ctx.fillText('Dotkni se pro start',W/2,H*.58+32);
    ctx.fillStyle='#94a3b8'; ctx.font='600 13px Inter, sans-serif'; ctx.fillText('dotkni se obrazovky',W/2,H*.58+54);
  }
  if(flash>0){ ctx.fillStyle='rgba(255,255,255,'+(flash/.25*.7)+')'; ctx.fillRect(-20,-20,W+40,H+40); }
  ctx.restore();
}
function glow(x,y,r,col){
  const g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2);
}

/* ---------- ŽEBŘÍČEK ---------- */
const LB_API = 'https://cichnovainfo.papousek.eu/api.php';
let runSeq = 0, runToken = null, lastRun = null, lbTab = modeId;
async function lbApi(op, body){
  const r = await fetch(LB_API+'?resource=flappy&op='+op, body ? {method:'POST', credentials:'omit', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)} : {cache:'no-store', credentials:'omit'});
  const d = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(d.error || ('HTTP '+r.status));
  return d;
}
/* ---------- postavy z administrace (Flappy → Herní postavy) ---------- */
function applyChars(chars){
  const old = {}; ENTITIES.forEach(e=>{ old[e.id]=e; });
  let next = (Array.isArray(chars)?chars:[]).filter(c=>c && c.id).map(c=>{
    const id = String(c.id), url = LB_API+'?resource=flappy&op=char_img&id='+encodeURIComponent(c.num)+'&v='+encodeURIComponent(c.v||0);
    const o = old[id];
    if(o && o.img===url){ o.name=String(c.name||''); o.scale=+c.scale||2.7; return o; }
    const e = { id, name:String(c.name||''), img:url, scale:+c.scale||2.7 }; initEntityImg(e); return e;
  });
  if(!next.length) next = [FALLBACK_ENT];
  ENTITIES.length = 0; next.forEach(e=>ENTITIES.push(e));
  const saved = store.get('flappy_ent','');
  selected = ENTITIES.find(x=>x.id===saved) || ENTITIES.find(x=>x===selected) || ENTITIES[0];
  renderPicker();
}
async function loadCustomChars(){
  try{
    const d = await lbApi('chars');
    const list = (d.chars||[]).map(c=>({id:c.id, num:c.num, name:c.name, scale:c.scale, v:c.v}));
    store.set('flappy_chars_cache', JSON.stringify(list));
    applyChars(list);
  }catch(e){}
}
try{ const cached = JSON.parse(store.get('flappy_chars_cache','[]')); if(cached.length) applyChars(cached); }catch(e){}   // hned zobrazí naposledy známé postavy
loadCustomChars();

async function lbLoad(){
  try{ const d = await lbApi('list&limit=10'); lbData = d.modes || {}; lbState = 'ok'; }
  catch(e){ if(!lbData) lbState = 'err'; }
  renderModes();
  if($('ov-board').classList.contains('open')) renderBoard();
}
/* každá hra dostane od serveru podepsaný token – jen s ním jde skóre zapsat (a jen jednou) */
function newRun(){
  const n = ++runSeq; runToken = null;
  lbApi('start', {mode:modeId}).then(d=>{ if(n===runSeq) runToken = d.token; }).catch(()=>{});
}
function lbRows(el, rows, meId, limit, me){
  el.innerHTML = '';
  if(!rows || !rows.length){ const p=document.createElement('div'); p.className='lbempty'; p.textContent='Zatím tu nikdo není. Buď první!'; el.appendChild(p); return; }
  const add = (r, rank)=>{
    const d=document.createElement('div'); d.className='lbrow'+(r.id===meId?' me':'');
    const a=document.createElement('span'); a.className='rk'; a.textContent = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank+'.';
    const b=document.createElement('span'); b.className='nm'; b.textContent=r.name;
    const c=document.createElement('span'); c.className='sc'; c.textContent=r.score;
    d.append(a,b,c); el.appendChild(d);
  };
  rows.slice(0,limit).forEach((r,i)=>add(r,i+1));
  if(me && me.rank>limit){ const g=document.createElement('div'); g.className='lbgap'; g.textContent='⋯'; el.appendChild(g); add(me, me.rank); }
}
function renderBoard(){
  const box=$('lb-tabs'); box.innerHTML='';
  Object.keys(MODES).forEach(id=>{
    const m=MODES[id], b=document.createElement('button');
    b.className='mbtn'+(id===lbTab?' sel':''); b.innerHTML='<span>'+m.icon+' '+m.name+'</span>';
    b.onclick=e=>{ e.stopPropagation(); lbTab=id; renderBoard(); };
    box.appendChild(b);
  });
  const list=$('lb-list');
  if(lbData===null){ list.innerHTML=''; const p=document.createElement('div'); p.className='lbempty'; p.textContent = lbState==='err' ? 'Žebříček se nepodařilo načíst.' : 'Načítám…'; list.appendChild(p); }
  else lbRows(list, lbData[lbTab]||[], 0, 10, null);
}
function openBoard(tab){
  lbTab = MODES[tab] ? tab : modeId;
  $('ov-board').classList.add('open'); renderBoard(); lbLoad();
}
$('btn-board').onclick = e=>{ e.stopPropagation(); openBoard(modeId); };
$('btn-board2').onclick = e=>{ e.stopPropagation(); openBoard(lastRun ? lastRun.mode : modeId); };
$('btn-board-close').onclick = e=>{ e.stopPropagation(); $('ov-board').classList.remove('open'); };
/* po konci hry: nabídka zápisu jména (jen když skóre > 0 a server vydal token) */
function prepSubmit(){
  lastRun = {score, mode:modeId, token:runToken, entity:selected.id, saved:false, saving:false};
  const ok = score>0 && !!runToken;
  $('o-submit').style.display = ok ? 'block' : 'none';
  $('o-form').style.display = 'block';
  $('o-board').innerHTML = ''; $('o-msg').textContent = ''; $('o-msg').className = 'smsg';
  $('o-name').value = framed ? '' : store.get('flappy_name','');   // na kiosku se jméno nepředvyplňuje (hraje víc lidí)
  $('btn-save').disabled = false;
}
async function saveScore(){
  const run = lastRun; if(!run || run.saving || run.saved) return;
  const name = $('o-name').value.replace(/\s+/g,' ').trim(), msg = $('o-msg');
  msg.className = 'smsg';
  if(!name){ msg.textContent='Napiš své herní jméno.'; msg.classList.add('err'); $('o-name').focus(); return; }
  run.saving = true; $('btn-save').disabled = true; msg.textContent = 'Ukládám…';
  try{
    const d = await lbApi('add', {token:run.token, name, score:run.score, entity:run.entity});
    run.saved = true;
    if(!framed) store.set('flappy_name', name);
    lbData = lbData || {}; lbData[d.mode] = d.rows; lbState = 'ok';
    if(run !== lastRun) return;
    $('o-form').style.display = 'none';
    const me = d.me, mine = me && me.id===d.id;
    msg.className = 'smsg ok';
    msg.textContent = !me ? 'Zapsáno! 🎉' : mine ? 'Zapsáno! Jsi na '+me.rank+'. místě 🎉' : 'Zapsáno. Tvé nejlepší skóre je '+me.score+' ('+me.rank+'. místo).';
    lbRows($('o-board'), d.rows, me ? me.id : 0, 5, me);
    renderModes();
  }catch(e){
    msg.textContent = e.message || 'Zápis se nepovedl.'; msg.classList.add('err'); $('btn-save').disabled = false;
  }
  run.saving = false;
}
$('btn-save').onclick = e=>{ e.stopPropagation(); saveScore(); };
$('o-name').addEventListener('keydown', e=>{ lastInput=performance.now(); if(e.key==='Enter'){ e.preventDefault(); saveScore(); } });
$('o-name').addEventListener('input', ()=>{ lastInput=performance.now(); });
lbLoad();
/* ---------- smyčka ---------- */
reset();
let lastT=performance.now();
let looping=false;
function loop(now){
  if(!OPEN){ looping=false; return; }
  const dt=Math.min(.033,(now-lastT)/1000); lastT=now;
  const idleLimit = (state==='over' && $('o-submit').style.display==='block' && $('o-form').style.display!=='none') ? 60000 : 25000;   // při psaní jména déle
  if((state==='over'||state==='ready') && now-lastInput>idleLimit){ $('ov-over').classList.remove('open'); $('ov-board').classList.remove('open'); $('ov-menu').classList.add('open'); state='menu'; reset(); }
  update(dt); render();
  requestAnimationFrame(loop);
}

window.__flap = { open(){
  OPEN=true; host.style.display='block'; fit(); lastInput=performance.now(); lastT=performance.now();
  state='menu'; reset(); $('ov-over').classList.remove('open'); $('ov-board').classList.remove('open'); $('ov-menu').classList.add('open');
  renderModes(); lbLoad();
  if(!looping){ looping=true; requestAnimationFrame(loop); }
}, close: closeGame };

window.ChFlappy=window.__flap;delete window.__flap;
})();
