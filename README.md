# Github repositories and users autocomplete component
This project presents an Autocomplete component made as a recruitment coding challenge.

## Approach to the problem
My understanding of "reusable and self-contained autocomplete component" was that the component itself should be able to 
handle all kinds of data and that Github users / repositories is only one of them.
That's why I decided to make both `Autocomplete` (standalone, reusable) and `GithubAutocomplete` (concrete implementation).

`Autocomplete` handles all the UI, feedback and controls, but it's the parent's job to provide a search function 
that has to fetch the data and return it in a generic format required by `Autocomplete`. 
This way it could be used for displaying items from any API (or anything else) as long as you transform it to the expected format.

I tried getting the details right when it comes to UX, such as properly debouncing the search or canceling it when not necessary. 
Same with the keyboard navigation and seamlessly scrolling to selected options, for example.  
Aside from that, I tried to keep it simple and not to overthink the solution.

## Testing
As probably most of React developers, I decided to go with integration testing using `Jest` + `React Testing Library`.
In addition to that I used `msw` package to mock API responses, so it's easier to test different happy and unhappy scenarios.  

## Why Next.js / Styled Components?
I suppose these two things were not too relevant to the task, so I just picked most convenient tools for me personally.
Of course in real life scenario the choice of these technologies would depend on the project. 
