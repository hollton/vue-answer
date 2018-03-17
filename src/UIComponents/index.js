import './styles/common.scss';

import Vue from 'vue';

import Button from './modules/button';
import Radio from './modules/radio';
import RadioGroup from './modules/radio-group';
import Checkbox from './modules/checkbox';
import CheckboxGroup from './modules/checkbox-group';
import MessageBox from './modules/message-box';
import Input from './modules/input';
import Textarea from './modules/textarea';
import Upload from './modules/upload';
import Cropper from './modules/cropper';
import Dialog from './modules/dialog';
import Tip from './modules/tip';
import Image from './modules/image';
import Progress from './modules/progress';
import Loading from './modules/loading';

const components = [
    Button,
    Radio,
    RadioGroup,
    Checkbox,
    CheckboxGroup,
    MessageBox,
    Input,
    Textarea,
    Upload,
    Cropper,
    Dialog,
    Tip,
    Image,
    Progress,
    Loading
];

const install = function(Vue) {
  /* istanbul ignore if */
  if (install.installed){
    return;
  }
  
  components.map(component => {
    Vue.component(component.name, component);
  });
  
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$warn = MessageBox.warn;
  Vue.prototype.$tip = Tip.tip;
};

install(Vue);

export default {
    Button,
    Radio,
    RadioGroup,
    Checkbox,
    CheckboxGroup,
    MessageBox,
    Input,
    Textarea,
    Upload,
    Cropper,
    Dialog,
    Tip,
    Image,
    Progress,
    Loading
}

export {
    Button,
    Radio,
    RadioGroup,
    Checkbox,
    CheckboxGroup,
    MessageBox,
    Input,
    Textarea,
    Upload,
    Cropper,
    Dialog,
    Tip,
    Image,
    Progress,
    Loading
}