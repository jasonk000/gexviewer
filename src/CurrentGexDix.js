import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

import './App.css';

const cellStyle = {
    padding: '10px',
}

function CurrentGexDix({recentData}) {
    const createTableRow = ({price, dix, gex, dateRaw}) =>
            <tr>
                <td style={cellStyle}>{dateRaw}</td>
                <td style={cellStyle}>{(dix*100).toFixed(1)}%</td>
                <td style={cellStyle}>{(gex/1e9).toFixed(1)}bn</td>
                <td style={cellStyle}>{(price*1).toFixed(0)}</td>
            </tr>

    return (
        <table>
            <thead>
                <th style={cellStyle}>date</th><th style={cellStyle}>dix</th><th style={cellStyle}>gex</th><th style={cellStyle}>price</th>
            </thead>
            <tbody>
            {recentData.map(createTableRow)}
            </tbody>
        </table>
    )
}

CurrentGexDix.propTypes = {
    recentData: PropTypes.arrayOf(PropTypes.shape({
        price: PropTypes.number.isRequired,
        dix: PropTypes.number.isRequired,
        gex: PropTypes.number.isRequired,
        dateRaw: PropTypes.string.isRequired,
    }))
}

export {CurrentGexDix}