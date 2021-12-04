import {parse} from '../include/csv-parse'
import * as d3 from 'd3'

const util = require('util')
const csvParse = util.promisify(parse)

export const jsonResponse = (value, init = {}) => {
    return new Response(JSON.stringify(value), {
        headers: { 'Content-Type': 'application/json', ...init.headers },
        ...init,
    })
}

export const loadFromUrl = async (url) => {
    const response = await fetch(url)
    const bodyText = await response.text()
    
    const parseOptions = { columns: true, skip_empty_lines: true }
    const records = await csvParse(bodyText, parseOptions)
    
    const parsed = records.map(r => {
        return {
            price: Number(r.price),
            dix: Number(r.dix),
            gex: Number(r.gex),
            dateRaw: r.date,
            date: Date.parse(r.date),
        }
    })
 
    return parsed
}

const lastNFromLoaded = (data, n) => {
    const records = [...data]
    records.sort((a, b) => a.date - b.date)
    return records.slice(-n)
}

const mixinForwardReturns = (data) => {
    const records = [...data]
    records.sort((a, b) => a.date - b.date)
    
    const withForward = records.map((record, index, array) => {
        const forwards = {}
        for (let i = 1; i <= 20; i++) {
            if ((index + i) in array) {
                forwards[i] = array[index + i].price
            }
        }
        
        return {
            ...record,
            forwards,
        }
    })
    
    return withForward
}

const findNClosest = (dataWithForward, { gex, dix }, n: number) => {
    const DIX_MIN = 0.33
    const DIX_MAX = 0.48
    const GEX_MIN = -5000000000
    const GEX_MAX = 25000000000

    const dixScale = d3.scaleLinear().domain([DIX_MIN, DIX_MAX]).range([0, 100])
    const gexScale = d3.scaleLinear().domain([GEX_MIN, GEX_MAX]).range([100, 0])

    // find the distance to all of the points
    const distanceFrom = (element) => {
        const dDix = dixScale(element.dix) - dixScale(dix)
        const dGex = gexScale(element.gex) - gexScale(gex)
        return Math.sqrt(dDix*dDix + dGex*dGex)
    }

    // sort by distance
    return [...dataWithForward]
        .sort((a, b) => distanceFrom(a) - distanceFrom(b))
        .slice(0, n)
}

const gexToSpxFromLoaded = (dataWithForward, duration) => {
    return dataWithForward.map(r => {
        return {
            gex: r.gex,
            dix: r.dix,
            forward: duration in r.forwards ? (r.forwards[duration] / r.price - 1) : null,
        }
    }).filter(r => r.forward != null)
}

export const handleGet = async (url) => {
    const data = await loadFromUrl(url)

    const dataWithForward = mixinForwardReturns(data)
    const lastFive = lastNFromLoaded(dataWithForward, 5)
    const lastElement = lastNFromLoaded(dataWithForward, 1)
    const gexToSpxScatter1 = gexToSpxFromLoaded(dataWithForward, 1)
    const gexToSpxScatter20 = gexToSpxFromLoaded(dataWithForward, 20)

    const tenClosestToLatest = findNClosest(dataWithForward, lastElement[0], 10)

    return {
        lastFive,
        gexToSpxScatter1,
        gexToSpxScatter20,
        tenClosestToLatest,
    }
}

export const onRequestGet = async ({ env }) => {
    const now = Date.now()
    const url = `https://squeezemetrics.com/monitor/static/DIX.csv?_t=${now}`
    const result = await handleGet(url)
    return jsonResponse(result)
}
