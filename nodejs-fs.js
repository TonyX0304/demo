const fileDir = 'D:/桌面/xiaomi/org'
const outPutDir = 'D:/桌面/xiaomi/rename'
const { execSync } = require('child_process');
const fs = require('node:fs');
const fsp = require('fs').promises; // 使用 Promise API
const path = require('node:path');

function getXiaomiVideoInfo(videoPath) {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
    const metadata = JSON.parse(execSync(command).toString());
    // 提取关键信息
    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
    const creationTime = new Date(videoStream.tags.creation_time)
    // const creationTime = new Date(metadata.format.tags['com.apple.quicktime.creationdate'])
    const creation_time = creationTime.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    return creation_time
  } catch (error) {
    console.error('解析失败:', error.message);
    return null;
  }
}

const todayString = new Date().toLocaleString('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).replaceAll('/','')

function renameByCreationTime(videoPath, index) {
  const realTime = getXiaomiVideoInfo(videoPath);
  if (!realTime) return;


  const ext = path.extname(videoPath);
  const newName = `${realTime}${ext}`.replaceAll('/', '-').replaceAll(':', '');
  console.log('[ realTime ] >', realTime + '---->' + newName)

  fs.copyFile(videoPath, outPutDir + '/' + newName, function (err) {
    if (err) {
      fsp.appendFile(`D:/桌面/xiaomi/rename-info-${todayString}.txt`, `重命名(${new Date().toLocaleString()})失败--序号:${index+1}: \n${fileOrgName} → ${newName}` + '\n\n');
    } else {
      const fileOrgName = path.basename(videoPath);
      fsp.appendFile(`D:/桌面/xiaomi/rename-info-${todayString}.txt`, `重命名(${new Date().toLocaleString()})--序号:${index+1}: \n${fileOrgName} → ${newName}` + '\n\n');
    }
  })
}


// 使用示例
emptyDirSync(outPutDir);

// 批量处理当前目录所有 MP4 文件
fs.readdirSync(fileDir).forEach((file, index) => {
  // if (file.endsWith('.mp4')) 
  renameByCreationTime(fileDir + '/' + file, index);
});


function emptyDirSync(dirPath) {
  // 检查目录是否存在
  if (!fs.existsSync(dirPath)) {
    return;
  }

  // 读取目录内容
  const files = fs.readdirSync(dirPath);

  // 遍历并删除每个文件/子目录
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 递归删除子目录
      emptyDirSync(filePath);
      fs.rmdirSync(filePath);
    } else {
      // 删除文件
      fs.unlinkSync(filePath);
    }
  }
}