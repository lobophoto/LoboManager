const express = require('express');
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const _ = require('lodash');

const config = require('../config');
const router = express.Router();


const configPath = path.join(config.baseDir, config.dir, './src/public/config.json');
const allConfig = config;

const getConfig = () => {
  let config = '';
  config = fs.readFileSync(configPath).toString();
  return JSON.parse(config);
}

const setConfig = (value) => {
  fs.writeFileSync(configPath, JSON.stringify(value, null, 2));
}

// 获取配置
router.get('/config', (req, res, next) => {
  try{
    const config = getConfig()
    res.send(config);
  }catch(e){
    next(e);
  }
});

// 新建folder
router.post('/folder', (req, res) => {
  const { folder } = req.query;
  const config = getConfig();
  if(!config.folders[folder]){
    config.folders[folder] = [];
  }
  setConfig(config);
  res.send({
    state: 'success'
  });
});

// 修改联系方式
router.post('/contact', (req, res) => {
  const contact = req.body;
  if(_.has(contact, 'email') && _.has(contact, 'phone') &&
      _.has(contact, 'wechat') && _.has(contact, 'QRCode') &&
      _.has(contact, 'LoboQRCode')
    ){
      const config = getConfig();
      config.contact = contact;
      setConfig(config);
      res.send({
        state: 'success'
      });
  }else{
    res.send({
      state: 'error',
      message: '缺少参数'
    });
  }
});

// 修改folder下的image
router.post('/image', (req, res) => {
  const { folder } = req.query;
  const files = req.files;
  let { images } = req.body;
  if(!folder){
    return res.send({
      state: 'error',
      message: '缺少folder'
    })
  }
  
  if(!images || images.constructor !== Array){
    images = [];
  }

  _.each(files, function(file){
    const { originalname, filename } = file;
    const oldPath = file.path;
    const extname = path.extname(originalname);
    const newFilename = filename + extname;
    try{
      fs.renameSync(
        oldPath, 
        path.join(allConfig.baseDir, allConfig.dir, './src/public/', newFilename)
      );
    }catch(e){
      console.log(e);
    }
    images.push(newFilename);
  });

  const config = getConfig();
  // 计算diff，删除图片
  const diff = _.difference(config.folders[folder], images);
  console.log(diff);
  console.log(config.folders[folder], images);
  _.each(diff, (img) => {
    fs.unlinkSync(path.join(allConfig.baseDir, allConfig.dir, './src/public/', img));
  });

  config.folders[folder] = images;
  setConfig(config);
  res.send({
    state: 'success'
  });
});


router.delete('/folder', (req, res) => {
  
});

// 发布
router.get('/publish', (req, res) => {
  const command = `cd ${path.join(config.baseDir, config.dir, 'src')} && make build && cd ..&& git add . && git commit -m "update" && git push -f`;
  try{
    const output = execSync(command).toString();
    console.log(output);
  }catch(e){
    res.send({
      state: 'error',
      message: '执行命令: '  + command + '失败'
    });
  }
  res.send({
    state: 'success'
  })
});

module.exports = router;
