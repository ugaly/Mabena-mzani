// assets
import { ChromeOutlined, QuestionOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const measurement = {
  id: 'Measurement',
  title: 'Measurement',
  type: 'group',
  children: [
    {
      id: 'vehicles',
      title: 'Vehicles',
      type: 'item',
      url: '/dashboard/vehicles',
      icon: icons.ChromeOutlined
    },
    
   
  ]
};

export default measurement;
