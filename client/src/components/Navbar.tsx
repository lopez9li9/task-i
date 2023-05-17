import { Link } from 'react-router-dom';

const Navbar = () => {
	return (
		<div className='flex flex-row justify-between px-5 py-3 font-bold text-red-600 bg-gray-200 dark:bg-gray-800 dark:text-slate-400'>
			<div className='px-3 py-1 text-lg rounded-2xl dark:bg-transparent dark:hover:bg-gray-700 dark:hover:text-gray-100'>
				<Link to='/'>Landing</Link>
			</div>
			<div>right</div>
		</div>
	);
};

export default Navbar;
