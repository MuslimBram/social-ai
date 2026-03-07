/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Accounts from './pages/Accounts';
import Analytics from './pages/Analytics';
import Automation from './pages/Automation';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import ContentCalendar from './pages/ContentCalendar';
import Dashboard from './pages/Dashboard';
import GenerationHistory from './pages/GenerationHistory';
import ImageGenerator from './pages/ImageGenerator';
import PostGenerator from './pages/PostGenerator';
import PostsManager from './pages/PostsManager';
import Settings from './pages/Settings';
import Templates from './pages/Templates';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accounts": Accounts,
    "Analytics": Analytics,
    "Automation": Automation,
    "CompetitorAnalysis": CompetitorAnalysis,
    "ContentCalendar": ContentCalendar,
    "Dashboard": Dashboard,
    "GenerationHistory": GenerationHistory,
    "ImageGenerator": ImageGenerator,
    "PostGenerator": PostGenerator,
    "PostsManager": PostsManager,
    "Settings": Settings,
    "Templates": Templates,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};