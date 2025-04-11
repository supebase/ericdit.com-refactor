interface IPResponse {
  ipinfo: {
    text: string;
  };
  ipdata: {
    info1: string;
  };
}

export const useGeoLocation = async () => {
  try {
    const data = await $fetch<IPResponse>("https://api.vore.top/api/IPdata", {
      timeout: 5000,
      retry: 2,
    });

    if (!data.ipinfo?.text || !data.ipdata?.info1) {
      return {
        ip: "未知",
        location: "位置未知",
      };
    }

    return {
      ip: data.ipinfo.text,
      location: data.ipdata.info1,
    };
  } catch (error) {
    return {
      ip: "未知",
      location: "位置未知",
    };
  }
};
