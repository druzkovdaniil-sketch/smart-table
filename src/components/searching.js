import {rules, createComparison} from "../lib/compare.js";


export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
const searchComparator = createComparison(
        rules.skipEmptyTargetValues,    
rules.searchMultipleFields(      
 searchField,        
['date', 'customer', 'seller'],  
 false  
  )
    );


    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
         const searchValue = state[searchField];

          if (!searchValue || searchValue.trim() === '') {
        return data;
    }
      const target = { [searchField]: searchValue };
        const result = data.filter(item => {
            return searchComparator(item, target);
        });
        
        return result;
    }
}