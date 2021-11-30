import { useState, useEffect, useRef } from 'react'
import { useWindowDimensions } from './hooks'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

import './App.css';

const GEX_MIN = -5000000000
const GEX_MAX = 25000000000
const FORWARD_MIN = -0.05
const FORWARD_MAX = 0.05

function GexSpxScatter({data, recentData}) {
    const plotArea = useRef(null)
    const verticalBars = useRef(null)

    const {width} = useWindowDimensions()

    const chartWidth = Math.min((0.8 * width), 1200)
    const chartHeight = (chartWidth / 2)

    const margin = {left: 100, right: 100, top: 100, bottom: 100}

    const renderArea = () => {
        const renderData = data
            .filter(d => d.gex >= GEX_MIN && d.gex <= GEX_MAX)
            .filter(d => d.forward >= FORWARD_MIN && d.forward <= FORWARD_MAX)

        const xScale = d3.scaleLinear().domain([GEX_MIN, GEX_MAX]).range([0, chartWidth])
        const yScale = d3.scaleLinear().domain([FORWARD_MIN, FORWARD_MAX]).range([chartHeight, 0])

        const vertColorScale = d3.scaleLinear().domain([0, recentData.length]).range([0, 1])

        const plotAreaG = d3.select(plotArea.current)

        plotAreaG.selectAll('*').remove()

        plotAreaG.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale).tickFormat(v => `${(v/1000000000).toFixed(0)} bn`))

        plotAreaG.append('g')
            .call(d3.axisLeft(yScale).tickFormat(v => `${(v*100).toFixed(0)}%`))

        plotAreaG.append('g')
            .selectAll()
            .data(renderData)
            .enter()
            .append('circle')
            .attr('cx', (d) => xScale(d.gex))
            .attr('cy', (d) => yScale(d.forward))
            .attr('r', 1.5)
            .style('fill', () => 'orange')
            .append('svg:title')
            .text((d) => JSON.stringify(d))
    
        const verticalBarsG = d3.select(verticalBars.current)

	verticalBarsG.selectAll('*').remove()

        verticalBarsG.selectAll()
            .data(recentData)
            .enter()
            .append('path')
            .attr('opacity', 1)
            .attr('stroke', (d, i) => d3.interpolateBuGn(vertColorScale(i)))
            .attr('stroke-width', '1px')
            .attr('d', d => `M${xScale(d.gex).toFixed()},${chartHeight} ${xScale(d.gex).toFixed()},0`)
    }

    useEffect(() => {
        if (plotArea.current && data.length > 0 && width > 0) {
            renderArea()
        }
    }, [plotArea, verticalBars, data, width])

    return (
        <svg width={chartWidth+margin.left+margin.right} height={chartHeight+margin.top+margin.bottom}>
            <g ref={plotArea} transform={`translate(${margin.left}, ${margin.top})`}/>
            <g ref={verticalBars} transform={`translate(${margin.left}, ${margin.top})`}/>
        </svg>)
}

GexSpxScatter.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        dix: PropTypes.number.isRequired,
        gex: PropTypes.number.isRequired,
        forward: PropTypes.number.isRequired,
    })),
    recentData: PropTypes.arrayOf(PropTypes.shape({
        price: PropTypes.number.isRequired,
        dix: PropTypes.number.isRequired,
        gex: PropTypes.number.isRequired,
        dateRaw: PropTypes.string.isRequired,
    }))
}

export {GexSpxScatter}
