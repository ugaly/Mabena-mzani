// assets
import { ChromeOutlined, QuestionOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const measurement = {
  id: 'weighing',
  title: 'Weighing',
  type: 'group',
  children: [
    {
      id: 'weighing_sales',
      title: 'Sales',
      type: 'item',
      url: '/weighing/sales',
      icon: icons.ChromeOutlined
    },
    
   
  ]
};

export default measurement;
