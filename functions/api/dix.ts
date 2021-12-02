import {parse} from '../include/csv-parse'

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

const lastFiveFromLoaded = (data) => {
    const records = [...data]
    records.sort((a, b) => a.date - b.date)
    return records.slice(-5)
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
    const lastFive = lastFiveFromLoaded(dataWithForward)
    const gexToSpxScatter1 = gexToSpxFromLoaded(dataWithForward, 1)
    const gexToSpxScatter20 = gexToSpxFromLoaded(dataWithForward, 20)

    return {
        lastFive,
        gexToSpxScatter1,
        gexToSpxScatter20,
    }
}

export const onRequestGet = async ({ env }) => {
    const now = Date.now()
    const url = `https://squeezemetrics.com/monitor/static/DIX.csv?_t=${now}`
    const result = await handleGet(url)
    return jsonResponse(result)
}
