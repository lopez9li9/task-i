import { createBrowserRouter } from 'react-router-dom';

import Landing from '../pages/Landing';
import Home from '../pages/Home';

const router = createBrowserRouter([
	{
		path: '/',
		Component: Landing,
	},
	{
		path: '/home',
		Component: Home,
	},
]);

export default router;
