/**
 * 获取文件后缀
 */
exports.getExt = function (str) {
  if(!str) {
    return ''
  }
  var index = str.lastIndexOf(".");
  var ext = str.substr(index + 1);
  return ext
}
