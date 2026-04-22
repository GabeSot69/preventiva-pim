import sanitizeHtml from 'sanitize-html';

export const sanitize = (input: any): any => {
  if (typeof input !== 'string') return input;
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

export const sanitizeObject = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as any;
  }

  if (typeof obj === 'object' && obj !== null) {
    const newObj = { ...obj } as any;
    for (const key in newObj) {
      newObj[key] = sanitizeObject(newObj[key]);
    }
    return newObj;
  }

  return sanitize(obj);
};
