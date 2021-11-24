import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

import './App.css';

const DIX_MIN = 0.33
const DIX_MAX = 0.48
const GEX_MIN = -5000000000
const GEX_MAX = 25000000000

function GexDixSpxScatter({data, recentData}) {
    const plotArea = useRef(null)
    const recentLineArea = useRef(null)

    const height = 800
    const width = 800
    const margin = {left: 100, right: 100, top: 100, bottom: 100}

    const renderArea = () => {
        const renderData = data
            .filter(d => d.dix >= DIX_MIN && d.dix <= DIX_MAX)
            .filter(d => d.gex >= GEX_MIN && d.gex <= GEX_MAX)

        const xScale = d3.scaleLinear().domain([DIX_MIN, DIX_MAX]).range([0, width])
        const yScale = d3.scaleLinear().domain([GEX_MIN, GEX_MAX]).range([height, 0])
        const colorScale = d3.scaleLinear().domain([-0.03, 0, 0.06]).range([0, 0.5, 1])
        const recentColorScale = d3.scaleLinear().domain([0, recentData.length]).range([0, 1])

        const plotAreaG = d3.select(plotArea.current)

        plotAreaG.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))

        plotAreaG.append('g')
            .call(d3.axisLeft(yScale))

        plotAreaG.append('g')
            .selectAll()
            .data(renderData)
            .enter()
            .append('circle')
            .attr('cx', (d) => xScale(d.dix))
            .attr('cy', (d) => yScale(d.gex))
            .attr('r', 3)
            .style('fill', (d) => d3.interpolateRdBu(colorScale(d.forward)))
            // .style('fill-opacity', 0.6)
            .append('svg:title')
            .text((d) => JSON.stringify(d))

        const recentLineAreaG = d3.select(recentLineArea.current)

        recentLineAreaG.append('path')
            .datum(recentData)
            .attr('opacity', 1)
            .attr('fill', 'none')
            .attr('stroke', 'rgb(21, 127, 60)')
            .attr('stroke-width', '4px')
            .attr('d', d3.line().x(d => Math.round(xScale(d.dix))).y(d => Math.round(yScale(d.gex))))
    }

    useEffect(() => {
        if (plotArea.current && data.length > 0) {
            renderArea()
        }
    }, [plotArea, data, recentData])

    return (
        <svg width={width+margin.left+margin.right} height={height+margin.top+margin.bottom}>
            <g ref={plotArea} transform={`translate(${margin.left}, ${margin.top})`}/>
            <g ref={recentLineArea} transform={`translate(${margin.left}, ${margin.top})`}/>
        </svg>)
}

GexDixSpxScatter.propTypes = {
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

export {GexDixSpxScatter}