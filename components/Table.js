import React, {Component} from "react";
import {Dimensions, Keyboard, ScrollView, View} from "react-native";
import {Block, Text} from "galio-framework";
import {Button} from "./index";
import {argonTheme} from "../constants";
const { width , height} = Dimensions.get("screen");

export default class Table extends React.Component {
    rows = false;

    constructor(props) {
        super(props);
        this.rows = this.props.rows;
    }

    renderRow(row,index) {
        if(!row.futureDay && row.logins) {
            let employer_saldo = row.employer_saldo != '00:00' ? (row.employer_saldo) : '';
            let employer_saldo_color = row.employer_saldo.includes('-') ? 'red' : 'green';
            return (
                <Block key={index} style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row'}}>
                    <Block style={{flex: 1, alignSelf: 'stretch',textAlign:'left'}}>
                        <Text style={{color: '#fff'}}>{row.date}</Text>
                    </Block>
                    {width >= 800 ? (
                        <Block style={{flex: 1, alignSelf: 'stretch'}}>
                            <Text style={{color: '#fff',textAlign:'left'}}>{row.weekday}</Text>
                        </Block>
                    ):false}
                    <Block style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={{color: '#fff',textAlign:'center'}}>{row.employer_entrance}</Text>
                    </Block>
                    <Block style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={{color: '#fff',textAlign:'center'}}>{row.employer_exit}</Text>
                    </Block>
                    <Block style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={{color: employer_saldo_color,textAlign:'right'}}>{row.employer_saldo != '00:00' ? row.employer_saldo : '' }</Text>
                    </Block>
                </Block>
            );
        }
    }

    render() {
        return (
            <Block style={{width:'100%'}}>
                <Block>
                {
                    this.rows.map((row,index) => {
                        return this.renderRow(row,index);
                    })
                }
                </Block>
            </Block>
        );
    }
}