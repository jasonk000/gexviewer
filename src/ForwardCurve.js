import { useEffect, useRef } from 'react'
import { useWindowDimensions } from './hooks'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

import './App.css';

function ForwardCurve({data, forwardDays}) {
    const plotArea = useRef(null)

    const {width} = useWindowDimensions()

    const margin = {left: 50, right: 50, top: 100, bottom: 100}

    const chartWidth = Math.min((0.9 * (width - margin.left - margin.right)), 1200)
    const chartHeight = (chartWidth / 2)

    const points = []
    let lineNo = 0

    for(const line of data) {
        points.push({ day: 0, delta: 0, lineNo })
        for (const day in line.forwards) {
            points.push({
                day,
                delta: (line.forwards[day] / line.price) - 1,
                lineNo,
                dix: line.dix,
                gex: line.gex,
            })
        }
        lineNo += 1
    }

    const lineSeries = []
    lineNo = 0
    for (const line of data) {
        const day = []
        day.push({ day: 0, delta: 0 })
        for (let i = 1; i <= Object.keys(line.forwards).length; i++) {
            day.push({ day: i, delta: (line.forwards[i] / line.price) - 1, lineNo })
        }
        lineSeries.push(day)
        lineNo++
    }

    const renderArea = () => {
        // three things
        // a chart area and axis
        // a series of dots
        // and the lines that connect them

        const xScale = d3.scaleLinear().domain([0, forwardDays]).range([0, chartWidth])
        const yScale = d3.scaleLinear().domain([-0.15, 0.15]).range([chartHeight, 0])

        // color scale: based on closeness to 'current' ie: order of results
        const vertColorScale = d3.scaleLinear().domain([0, lineNo - 1]).range([0, 0.9])

        const plotAreaG = d3.select(plotArea.current)
        plotAreaG.selectAll('*').remove()

        plotAreaG.append('g')
            .attr('transform', `translate(0,${chartHeight/2})`)
            .call(d3.axisBottom(xScale).tickFormat(v => `+${v}d`))

        plotAreaG.append('g')
            .call(d3.axisLeft(yScale).tickFormat(v => `${(v*100).toFixed(0)}%`))

        plotAreaG.append('g')
            .selectAll()
            .data(points)
            .enter()
            .append('circle')
            .attr('cx', (d) => xScale(d.day))
            .attr('cy', (d) => yScale(d.delta))
            .attr('r', 4)
            .style('fill', (d) => d3.interpolateGreys(vertColorScale(d.lineNo)))
            .append('svg:title')
            .text((d) => JSON.stringify({dix: d.dix, gex: d.gex}))

        const lineFn = d3.line().x(d => xScale(d.day)).y(d => yScale(d.delta))

        plotAreaG.append('g')
            .selectAll()
            .data(lineSeries)
            .enter()
            .append('path')
            .attr('d', lineFn)
            .style('fill', 'none')
            .attr('stroke-width', '1px')
            .attr('stroke', (d, i) => d3.interpolateGreys(vertColorScale(i)))
    }

    useEffect(() => {
        if (plotArea.current && data.length > 0 && width > 0) {
            renderArea()
        }
    }, [plotArea, data, width])

    return (
        <svg width={chartWidth+margin.left+margin.right} height={chartHeight+margin.top+margin.bottom}>
            <g ref={plotArea} transform={`translate(${margin.left}, ${margin.top})`}/>
        </svg>)
}

ForwardCurve.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        price: PropTypes.number.isRequired,
        forwards: PropTypes.arrayOf(PropTypes.number).isRequired,
    })),
    forwardDays: PropTypes.number.isRequired,
}

export {ForwardCurve}
