import React, { Component } from 'react'
import { Button, Input } from 'antd'
import {SearchOutlined } from '@ant-design/icons';
// import { ALIICONURL } from '../../../utils/constant';
import { getToken } from '../../../utils/request/auth';
import { NICKNAME } from '../../../utils/constant';
import './Header.css'

export default class Header extends Component {
    //header just updated in initilization
    shouldComponentUpdate(){
        return false;
    }

    render() {
        // const IconFont = createFromIconfontCN({
        //     scriptUrl: ALIICONURL,
        // });
        const nickName = getToken(NICKNAME)
        return (
            <div className='header'>
                <div className='header_padd'>
                    <div className='header_left'>
                        <Button size='small' type='primary' className='header_button1'>Jack</Button>
                    </div>
                    <div className='auto'>
                        <Input className='auto_search' prefix={<SearchOutlined />}  placeholder="Search(CtrI+Shift+F)" />
                    </div>
                    <div className='header_right'>
                        {/* <IconFont type="icon-reloadtime" className='header_icon' /> */}
                        <span className='iconfont icon-reloadtime header_icon'></span>
                        
                        {/* <Button type='primary' icon={<IconFont type="icon-zengjia" />} className='header_button2'></Button> */}
                        <Button type='primary' icon={<span className='iconfont icon-zengjia'></span>} className='header_button2'></Button>
                    </div>
                </div>
            </div>
        )
    }
}
