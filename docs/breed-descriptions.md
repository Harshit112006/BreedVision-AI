# Breed library descriptions

Each of the 49 breeds the model can identify has a description, a list of traits
and the sources it was summarised from, shown on its page in the breed library.
Data: `web/src/services/mock/breed-info.ts`. Guard test: `web/tests/breeds.test.mts`
(every breed has a description, traits and a source; no breed outside the 49).

## How they were written

Researched on 26 Oct 2026 and written **only from what the cited pages say**. A
trait is left out if its pages were silent; nothing was filled in from memory.
That replaced an earlier set of short notes that could not be traced to a source.
Where sources disagree (Khariar horn direction, Ghumsari milk yield, Thutho horns,
Himachali Pahari yield) the text says so.

The **home tract** of every breed is the home state(s) in the ICAR-NBAGR "Cattle
Breeds of India" registry (https://nbagr.res.in/cattle-breed), which lists names,
states and accession numbers but no descriptions.

## Where the facts came from

| Source | Breeds |
|---|---|
| TNAU Agritech Portal, indigenous cattle breeds (read in full) | Amritmahal, Bargur, Deoni, Gir, Hallikar, Hariana, Kangayam, Kankrej, Khillari, Krishna Valley, Ongole, Pulikulam, Red Sindhi, Sahiwal, Tharparkar, Umblachery |
| Wikipedia breed pages (read in full) | Dangi, Kenkatha, Malnad Gidda, Mewati, Nimari, Punganur, Rathi, Red Kandhari, Vechur, Bachaur, Gangatari, Kherigarh |
| Wikipedia breed pages (seen through search summaries only) | Badri, Belahi (Bhelai), Gaolao, Nagori, Ponwar, Siri, Poda Thirupu (recognition year) |
| ICAR journal papers | Nari (NBAGR study, read from the PDF), Dagri (Indian Journal of Animal Sciences 91(7), 2021, read from the PDF), Kosali, Purnea, Poda Thirupu |
| ICAR-NBAGR breed pages (seen through search summaries only; the host did not resolve from this machine) | Himachali Pahari, Konkan Kapila, Ladakhi, Thutho |
| State and portal pages (search summaries only) | Khariar, Motu, Ghumsari (Odisha Livestock Resources Development Society); Lakhimi, Shweta Kapila, Himachali Pahari, Khariar (Dairy Knowledge Portal, NDDB); Malvi, Nagori (Oklahoma State breed pages) |

## What to be careful about

- **These are breed-guide and journal summaries, not the ICAR breed monographs.**
  Several breeds rest on a single secondary page (Wikipedia or a dairy portal).
- **Thin entries:** Gangatari, Kherigarh, Bachaur, Mewati, Kenkatha, Dangi, Vechur
  and Siri have only a few traits because their sources say little. Their cards are
  short rather than padded.
- **Milk figures differ by source and era**, so each figure names what it measures
  (per lactation, per day) and the text flags known disagreements. They are not a
  promise for any individual animal.
- **Odisha and NBAGR pages were read through search summaries,** not opened in
  full, for the breeds in the last two table rows. Verify a specific figure before
  quoting it.
- **Descriptions are English only.** The headings, the "Sources" line and its
  caveat are translated; the breed text itself is not.
- The "Related breeds" links were kept from the earlier library and reflect
  region and use, not a genetic claim.
