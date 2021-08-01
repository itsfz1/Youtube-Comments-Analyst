import React from 'react'
import { useState } from 'react';

export const User = () =>
{
    const [ inputValue, setinputValue ] = useState( "" )
    const [ intensity, setintensity ] = useState( "" )
    const [ error, seterror ] = useState( "" )
    const vader = require( 'vader-sentiment' )
    const replies = []
    const comments = []

    const handleChange = ( e ) =>
    {
        e.preventDefault()
        if ( e.target.value.length !== "11" ) {
            setinputValue( e.target.value.slice( 32, 43 ) )
        }
        else {
            setinputValue( e.target.value )
        }
    }

    const handleComputation = ( inVader ) =>
    {
        setintensity( vader.SentimentIntensityAnalyzer.polarity_scores( inVader ) )
    }

    const handleError = ( error ) =>
    {
        seterror( error )
    }

    const req = async ( e ) =>
    {
        e.preventDefault();
        let nptStatus = true
        let nextPageToken = ""
        const key = "YOUR_YOUTUBE_API_KEY"

        while ( nptStatus ) {

            const initial = nextPageToken ? `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&maxResults=100&moderationStatus=published&order=relevance&pageToken=${nextPageToken}&textFormat=plainText&videoId=${inputValue}&key=${key}` :
                `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&maxResults=100&moderationStatus=published&order=relevance&textFormat=plainText&videoId=${inputValue}&key=${key}`
            const res = await fetch( initial )
            const result = await res.json()

            if ( 'error' in result ) {
                handleError( result.error.errors[ 0 ].reason )
                return
            }
            else {
                handleError( false )
            }

            for ( const val in result[ 'items' ] ) {
                comments.push( result[ 'items' ][ val ][ 'snippet' ][ 'topLevelComment' ][ 'snippet' ][ 'textDisplay' ] )
                const replycount = result[ 'items' ][ val ][ 'snippet' ][ 'totalReplyCount' ]
                if ( replycount > 0 ) {
                    for ( const reply in result[ 'items' ][ val ][ 'replies' ][ 'comments' ] ) {
                        replies.push( result[ 'items' ][ val ][ 'replies' ][ 'comments' ][ reply ][ 'snippet' ][ 'textDisplay' ] )
                    }
                }
            }
            if ( 'nextPageToken' in result ) {
                nextPageToken = result.nextPageToken
            }
            else {
                nptStatus = false
            }
        }
        const arr1 = comments.toString()
        const arr2 = replies.toString()
        const inVader = arr1.concat( arr2 )
        handleComputation( inVader )
    }

    //Using conditional operators in paragraph thats why declaring it with string variable
    const p1 = "The compound score is computed by summing the valence scores of each word in the, adjusted according to the rules, and then normalized to be between -1 (most extreme negative) and +1 (most extreme positive)."
    const p2 = "Positive Sentiment: Compound Score >= 0.05 Neutral Sentiment: (Compound Score > -0.05) and (Compound Score < 0.05) Negative Sentiment: Compound Score <= -0.05"
    const p3 = "The Positive, Neutral, and Negative scores are ratios for proportions of text that fall in each category"
    return (
        <div >
            <div className="header" />
            <h1>Youtube Comments Analyst</h1>
            <form onSubmit={req} className="user-input">
                <input type="text" placeholder="Enter Video Link Or Id" onChange={handleChange} required />
                <button type="submit">Analyze</button>
            </form>
            <ul>
                <li>{p1}</li>
                <li>{p2}</li>
                <li>{p3}</li>
            </ul>
            {intensity && !error && <span>
                Compound: {intensity.compound + ' | '}
                Negative: {intensity.neg + ' | '}
                Neutral: {intensity.neu + ' | '}
                Positive: {intensity.pos}
                {intensity.compound >= 0.05 ? <img src="http://localhost:3000/positive.png" alt="Positive" /> :
                    ( intensity.compound > -0.05 && intensity.compound < 0.05 ) ? <img src="http://localhost:3000/neutral.png" alt="Neutral" /> :
                        <img src="http://localhost:3000/positive.png" alt="Negative" />
                }
            </span>
            }
            {error && <h2>Please Check Your Link!: {error} </h2>}
        </div>
    )
}
