// assets
import { ChromeOutlined, QuestionOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const support = {
  id: 'Setup',
  title: 'Setup',
  type: 'group',
  children: [
    {
      id: 'axel-group',
      title: 'Axel Group',
      type: 'item',
      url: '/dashboard/axel-group',
      icon: icons.ChromeOutlined
    },
    {
        id: 'vehicle-type',
        title: 'Vehicle Type',
        type: 'item',
        url: '/dashboard/vehicle-type',
        icon: icons.ChromeOutlined
    }
   
  ]
};

export default support;
