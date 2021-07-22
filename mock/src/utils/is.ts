import _ from 'lodash';

export function isDateString(str = '') {
  if(typeof str !== 'string'){
    return false
  }
  const [year, month, day] = str.split('-');
  if (Number.isNaN(_.toNumber(year))) {
    return false;
  }
  if (Number.isNaN(_.toNumber(month))) {
    return false;
  }
  if (Number.isNaN(_.toNumber(day))) {
    return false;
  }
  if (_.toNumber(month) > 12 || _.toNumber(month) < 1) {
    return false;
  }
  if (_.toNumber(day) > 31 || _.toNumber(day) < 1) {
    return false;
  }
  return true;
}