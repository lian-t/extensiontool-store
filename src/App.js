import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import GitHubCorners from '@uiw/react-github-corners';
import Footer from './component/Footer';
// import source from './document.json';
import { github, zhHans, website } from './component/Icons';
import './App.scss';

const initStar = JSON.parse(localStorage.getItem('osc-doc-star'));
const initTag = JSON.parse(localStorage.getItem('osc-doc-tag'));

var language = navigator.language || navigator.userLanguage; 
var fileName = language ? language +'.json' :'zh.json'
const data = require('./document/'+fileName)

let source = data
const languageList = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'ara', label: 'العربية' },
    { value: 'jp', label: '日本語' },
    { value: 'kor', label: '한국어' },
  ]
function useData() {
    const [lists,setLists] = useState(source);
    const [star, setStar] = useState(initStar || []);
    const [tag, setTag] = useState(initTag || 'all');
    const [query, setQuery] = useState('');
    const [subMenu,setSubMenu] = useState(lists.useState);
    const [selected,setSelectedOptions] = useState([]);
     
    // useEffect(() => {
    //     const docs = localStorage.getItem('osc-doc');
    //     if (!docs) {
    //         localStorage.setItem('osc-doc', JSON.stringify(source));
    //     }
    // }, []);

    useEffect(() => {
        // 从 localStorage 获取上次选择的语言，如果没有则使用浏览器语言
        const savedLanguage = localStorage.getItem('selected-language');
        const browserLang = navigator.language.split('-')[0];
        const defaultLang = savedLanguage || browserLang || 'zh';
        
        try {
            const lists = require(`./document/${defaultLang}.json`);
            setLists(lists);
            setSubMenu(lists.useState || []);
            setSelectedOptions(defaultLang);
        } catch (error) {
            console.error('加载默认语言失败，使用中文', error);
            const zhLists = require('./document/zh.json');
            setLists(zhLists);
            setSubMenu(zhLists.useState || []);
            setSelectedOptions('zh');
        }
    }, []);

    const changeTag = (str) => {
        setTag(str);
        setQuery('');
        localStorage.setItem('osc-doc-tag', JSON.stringify(str));
    }

    const addStar = (title) => {
        const arr = [...star];
        arr.indexOf(title) === -1 ? arr.push(title) : arr.splice(arr.indexOf(title), 1);
        setStar(arr);
        localStorage.setItem('osc-doc-star', JSON.stringify(arr));
    }

    // const changeLanguage = (e) => {
    //     setSelectedOptions(e.target.value)
    //     console.log(e.target.value)
    //     let lists = require('./document/'+e.target.value +'.json')
    //     let a =!query ? lists : lists.filter(item => item.title.toLowerCase().indexOf(query.toLowerCase()) > -1)
    //     setLists(a)        
    //     setSubMenu(a.useState)
    // }

    const changeLanguage = (e) => {
        const selectedLang = e.target.value;
        setSelectedOptions(selectedLang);
        try {
            // 动态导入对应的语言文件
            const lists = require(`./document/${selectedLang}.json`);
            setLists(lists);
            setSubMenu(lists.useState || []); // 添加空数组作为默认值
            localStorage.setItem('selected-language', selectedLang); // 保存语言选择
        } catch (error) {
            console.error(`无法加载语言文件: ${selectedLang}`, error);
        }
    }

     
    return { lists, star, setStar, tag, setTag, query, setQuery, subMenu, changeTag, addStar, changeLanguage, selected,setSelectedOptions };
}

export default function App() {
    const { star, tag, setQuery, subMenu, changeTag, addStar, changeLanguage, selected, lists } = useData();
    return (
        <div className="warpper">
            {/* <GitHubCorners fixed position="left" size={62} zIndex={1000} href="https://github.com/jaywcjlove/dev-site" target="__blank" /> */}
            <div className="header">
                <span className="title">{lists.title}</span>
                {tag === 'all' && <input placeholder={lists.search} className="search" onChange={(e) => setQuery(e.target.value)} />}
                <div className="tag">
                    {subMenu.map((item, idx) => {
                        return (
                            <span
                                className={classNames({
                                    active: tag === item.tag,
                                })}
                                key={idx}
                                onClick={() => changeTag(item.tag)}
                            >
                {item.title}
              </span>
                        );
                    })}
                </div>
                <div className="tag language">
                    <select value={selected || []} onChange={changeLanguage} multiple={false}>
                        {languageList.map((item,index) => {
                            return (
                                <option key={item.label} value={item.value}>
                                    {item.label}
                                </option>
                            )
                        })}
                        
                    </select>
                </div>
            </div>
            {star.length === 0 && tag === '__star__' && <div className="noFind">{lists.collect}</div>}
            <ul className="lists">
                {lists.list.map((item, idx) => {
                    const urls = [];
                    for (const key in item.urls) {
                        if (Object.prototype.hasOwnProperty.call(item.urls, key)) {
                            let icon = '';
                            let title= key
                            if (/^git/.test(key)) {
                                icon = github;
                                title = 'Git 仓库';
                            } else if (/^cn/.test(key)) {
                                icon = zhHans;
                                title = '中文网站';
                            } else icon = website;
                            urls.push(
                                <a key={key} target="_blank" rel="noreferrer" title={title} href={item.urls[key]}>
                                    {icon}
                                </a>
                            );
                        }
                    }
                    const isTag = item.tags.filter(t => t === tag);
                    const isStar = star.filter(t => t === item.title);
                    if (tag === 'all' || (tag === '__star__' && isStar.length > 0) || isTag.length > 0) {
                        return (
                            <li key={idx}>
                                <a className="itemHeader" target="_blank" rel="noreferrer" href={item.website}>
                                    <div className="logo">
                                        {item.title && <h4><span>{item.title}</span></h4>}
                                        {item.logo && <img alt={item.title} src={item.logo} />}
                                    </div>
                                    <div className="details">
                                        {item.des}
                                    </div>
                                </a>
                                <div className="bottomBar">
                                    <div className="urls">{urls}</div>
                                    <div
                                        className={classNames('star', {
                                            active: star.indexOf(item.title) > -1,
                                        })}
                                        onClick={() => addStar(item.title)}
                                    >
                                        <svg>
                                            <use xlinkHref={`./dev.svg#icon-heart`} />
                                        </svg>
                                    </div>
                                </div>
                            </li>
                        );
                    }
                    return null;
                })}
            </ul>
            <Footer>
                Copyright © 2018 <a target="_blank" rel="noopener noreferrer" href="https://github.com/jaywcjlove/dev-site">dev-site</a>
            </Footer>
        </div>
    );
}