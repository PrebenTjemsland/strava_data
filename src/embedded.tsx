import React, { useEffect } from 'react';

function Embedded() {
    // useEffect runs after the component's output has been rendered to the DOM.
    useEffect(() => {
        // This is the Strava embed script URL.
        const scriptSrc = 'https://strava-embeds.com/embed.js';

        // We check if a script with this src already exists to avoid adding it
        // multiple times if the component re-renders.
        if (document.querySelector(`script[src="${scriptSrc}"]`)) {
            // If the script is already there, we can sometimes trigger a re-scan
            // if the embed library supports it. For Strava, the script
            // automatically scans on load, so we usually don't need to do anything else.
            return;
        }

        // If the script doesn't exist, we create it and append it to the document.
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;

        document.body.appendChild(script);

        // This optional cleanup function will run if the component is ever unmounted.
        // It's good practice, but for a global script like this, you might
        // choose to leave it loaded if other parts of your app use it.
        return () => {
            if (script && document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []); // The empty dependency array `[]` means this effect runs only once after the initial render.

    return (
        <div>
            <h1>My Strava Activity</h1>
            {/* The placeholder div that the Strava script will target */}
            <div className="strava-embed-placeholder" data-embed-type="activity" data-embed-id="15672314847"></div>
            <iframe
                height="160"
                width="300"
                allowTransparency={true}
                src="https://www.strava.com/athletes/55625138/activity-summary/83ab7659aab4a89afde22d5328938d70a6a4997e"
            ></iframe>
        </div>
    );
}

export default Embedded;
