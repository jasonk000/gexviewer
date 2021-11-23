import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

import './App.css';

function CurrentGexDix({recentData}) {
    const createTableRow = ({price, dix, gex, dateRaw}) =>
            <tr>
                <td>{dateRaw}</td>
                <td>{(dix*100).toFixed(1)}%</td>
                <td>{(gex/1e9).toFixed(1)}bn</td>
                <td>{(price*1).toFixed(0)}</td>
            </tr>

    return (
        <table>
            <thead>
                <th>date</th><th>dix</th><th>gex</th><th>price</th>
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