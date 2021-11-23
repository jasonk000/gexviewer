import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

import './App.css';

const DIX_MIN = 0.33
const DIX_MAX = 0.48
const GEX_MIN = -5000000000
const GEX_MAX = 25000000000

function GexToSpxScatter({data}) {
    const svgElement = useRef(null)

    const height = 200
    const width = 200
    const margin = {left: 100, right: 100, top: 100, bottom: 100}

    const renderArea = () => {
        const renderData = data
            .filter(d => d.dix >= DIX_MIN && d.dix <= DIX_MAX)
            .filter(d => d.gex >= GEX_MIN && d.gex <= GEX_MAX)

        const xScale = d3.scaleLinear().domain([DIX_MIN, DIX_MAX]).range([0, width])
        const yScale = d3.scaleLinear().domain([GEX_MIN, GEX_MAX]).range([height, 0])
        const colorScale = d3.scaleLinear().domain([-0.03, 0, 0.06]).range([0, 0.5, 1])

        const svg = d3.select(svgElement.current)

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))

        svg.append('g')
            .call(d3.axisLeft(yScale))

        svg.append('g')
            .selectAll()
            .data(renderData)
            .enter()
            .append('circle')
            .attr('cx', (d) => xScale(d.dix))
            .attr('cy', (d) => yScale(d.gex))
            .attr('r', 1.5)
            .style('fill', (d) => d3.interpolateRdBu(colorScale(d.forward)))
            .style('fill-opacity', 0.6)
            .append('svg:title')
            .text((d) => JSON.stringify(d))
    }

    useEffect(() => {
        if (svgElement.current && data.length > 0) {
            renderArea()
        }
    }, [svgElement, data])

    return (
        <svg  width={width+margin.left+margin.right} height={height+margin.top+margin.bottom}>
            <g ref={svgElement} transform={`translate(${margin.left}, ${margin.top})`}/>
        </svg>)
}

GexToSpxScatter.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        dix: PropTypes.number.isRequired,
        gex: PropTypes.number.isRequired,
        forward: PropTypes.number.isRequired,
    }))
}

export {GexToSpxScatter}