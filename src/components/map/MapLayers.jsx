import { Marker, Popup } from 'react-leaflet';
import { cityGroupIcon, listingIcon, townIcon } from './markerIcons.js';
import { CityGroupPopup, ListingPopup } from '../popups/ListingPopup.jsx';
import { TownPopup } from '../popups/TownPopup.jsx';

const DIMMED = 0.35;
const opacityFor = (isActive) => (isActive ? 1 : DIMMED);

export function ListingMarkers({ placed, groups, activeIds }) {
  return (
    <>
      {placed.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lon]}
          icon={listingIcon()}
          opacity={opacityFor(activeIds.has(listing.id))}
          title={`${listing.name}, ${listing.city} (Green Book listing, address match)`}
        >
          <Popup maxWidth={320}>
            <ListingPopup listing={listing} />
          </Popup>
        </Marker>
      ))}
      {groups.map((group) => (
        <Marker
          key={group.city}
          position={[group.lat, group.lon]}
          icon={cityGroupIcon(group.members.length)}
          opacity={opacityFor(group.members.some((m) => activeIds.has(m.id)))}
          title={`${group.members.length} Green Book listings in ${group.city}, approximate (city)`}
        >
          <Popup maxWidth={340}>
            <CityGroupPopup group={group} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export function TownMarkers({ towns, activeIds }) {
  return towns.map((town) => (
    <Marker
      key={town.id}
      position={[town.lat, town.lon]}
      icon={townIcon(town.status_label)}
      opacity={opacityFor(activeIds.has(town.id))}
      zIndexOffset={200}
      title={`${town.place}: sundown database entry, ${town.status_label}`}
    >
      <Popup maxWidth={340}>
        <TownPopup town={town} />
      </Popup>
    </Marker>
  ));
}
