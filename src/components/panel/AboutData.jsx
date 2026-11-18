const TOUGALOO = 'https://justice.tougaloo.edu/';
const NYPL = 'https://digitalcollections.nypl.org/items/9d4e7020-83b9-0132-4aed-58d385a7b928';
const REPO = 'https://github.com/mayank-jain632/green-book-texas-1956';

export function AboutData() {
  return (
    <details className="control-block about">
      <summary>About this data and its limits</summary>
      <ul className="plain-list">
        <li>
          <strong>Green Book listings.</strong> The Green Book listed businesses, not towns. A listing was not
          a guarantee of protection or welcome. This map uses one edition (
          <a href={NYPL}>Fall 1956</a>, NYPL Digital Collections), Texas only, lodging and restaurants only.
        </li>
        <li>
          <strong>Sundown town entries.</strong> The{' '}
          <a href={TOUGALOO}>Tougaloo College Sundown Towns Database</a> is crowdsourced and incomplete. A town
          missing from it is not evidence that it was welcoming. This map shows a hand-compiled sample of 19
          of the roughly 107 Texas entries, paraphrased, with links to the full entries.
        </li>
        <li>
          <strong>Two kinds of time.</strong> Green Book listings are information a traveler in 1956 could
          have had. The sundown research began around 1999 (James Loewen) and the database followed. Many
          entries describe other decades, so an entry may not describe 1956.
        </li>
        <li>
          <strong>Errors.</strong> The listings were read from scanned pages, and some OCR errors were
          corrected by hand. Locations come from today&rsquo;s street grid, so many 1956 addresses could
          only be placed at a town center. These are marked on the map.
        </li>
        <li>
          <strong>Routes.</strong> Route lines use today&rsquo;s road network, not 1956&rsquo;s.
        </li>
        <li>
          <strong>What this is not.</strong> This map does not rate routes or places. For Black travelers in
          the 1950s, knowing where to stop was a patchwork of incomplete and often word-of-mouth information,
          and a tool cannot rebuild that.
        </li>
      </ul>
      <p className="muted">
        Map tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.
        Geocoding: US Census Geocoder and Nominatim. Routes: OSRM. Code and data notes:{' '}
        <a href={REPO}>GitHub</a>.
      </p>
    </details>
  );
}
