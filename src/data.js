// import {makeIndex} from "./lib/utils.js";

// export function initData(sourceData) {
//     const sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
//     const customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
//     const data = sourceData.purchase_records.map(item => ({
//         id: item.receipt_id,
//         date: item.date,
//         seller: sellers[item.seller_id],
//         customer: customers[item.customer_id],
//         total: item.total_amount
//     }));
//     return {sellers, customers, data};
// }
const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";
export function initData() {
  let sellers = null;
  let customers = null;
  let lastResult = null;
  let lastQuery = null;

  const mapRecords = (data) => {
    if (!sellers || !customers) return [];

    return data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));
  };

  /**

     * @returns {Promise<Object>}
     */
  const getIndexes = async () => {
    if (sellers && customers) {
      return { sellers, customers };
    }
    try {
      [sellers, customers] = await Promise.all([
        fetch(`${BASE_URL}/sellers`).then((res) => res.json()),
        fetch(`${BASE_URL}/customers`).then((res) => res.json()),
      ]);
      return { sellers, customers };
    } catch (error) {
      console.error("Ошибка загрузки индексов:", error);
      return { sellers: {}, customers: {} };
    }
  };

  /**
   * @param {Object} query
   * @param {boolean} isUpdated
   * @returns {Promise<Object>}
   */
  const getRecords = async (query = {}, isUpdated = false) => {
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated && lastResult) {
      return lastResult;
    }
    try {
      const response = await fetch(`${BASE_URL}/records?${nextQuery}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const records = await response.json();

      lastQuery = nextQuery;
      lastResult = {
        total: records.total,
        items: mapRecords(records.items),
      };

      return lastResult;
    } catch (error) {
      console.error("Ошибка загрузки записей:", error);
      return { total: 0, items: [] };
    }
  };

  return {
    getIndexes,
    getRecords,
  };
}
