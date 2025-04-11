const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const customHeaders = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': '*/*',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Connection': 'keep-alive',
};

app.use('/', createProxyMiddleware({
  target: 'https://m.facebook.com',
  changeOrigin: true,
  secure: false,
  headers: customHeaders,
  pathRewrite: { '^/': '/' },
  onProxyReq: (proxyReq, req, res) => {
    if (req.method === 'POST' && req.body) {
      const bodyData = new URLSearchParams(req.body).toString();
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    proxyReq.setHeader('referer', 'https://m.facebook.com/');
  }
  onProxyRes: (proxyRes, req, res) => {
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['x-frame-options'];
  },
  cookieDomainRewrite: "localhost",
  selfHandleResponse: false,
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy thần thánh đang chạy tại http://localhost:${PORT}`);
});
