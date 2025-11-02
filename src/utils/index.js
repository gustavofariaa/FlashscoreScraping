export const pLimit = (concurrency, retries = 3) => {
  let activeCount = 0;
  const queue = [];

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const withRetry = async (fn, left = retries) => {
    try {
      return await fn();
    } catch (err) {
      if (left === 0) throw err;
      const delay = (retries - left + 1) * 500;
      console.warn(`⚠️ Retry in ${delay}ms...`);
      await sleep(delay);
      return withRetry(fn, left - 1);
    }
  };

  const next = () => {
    activeCount--;
    if (queue.length > 0) queue.shift()();
  };

  const run = async (fn, resolve) => {
    activeCount++;
    try {
      const result = await withRetry(fn);
      resolve(result);
    } finally {
      next();
    }
  };

  return (fn) =>
    new Promise((resolve) => {
      const task = () => run(fn, resolve);
      if (activeCount < concurrency) {
        task();
      } else {
        queue.push(task);
      }
    });
};
