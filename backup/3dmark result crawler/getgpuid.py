import requests
import json
import time
import os

def read_gpu_list():
    """
    从 gpulist.json 读取显卡列表
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        gpu_list_file = os.path.join(current_dir, 'gpulist.json')
        
        with open(gpu_list_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('desktop', [])  # 只返回desktop显卡列表
    except Exception as e:
        print(f"读取GPU列表文件时出错: {e}")
        return []

def get_gpu_mapping():
    """
    获取显卡名称到GPU ID的映射关系
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        mapping_file = os.path.join(current_dir, 'gpumap.json')
        
        with open(mapping_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}  # 返回空字典
    except Exception as e:
        print(f"读取映射文件时出错: {e}")
        return {}

def save_gpu_mapping(gpu_mapping):
    """
    保存显卡名称到GPU ID的映射关系
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        mapping_file = os.path.join(current_dir, 'gpumap.json')
        
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(gpu_mapping, f, ensure_ascii=False, indent=2)
        
        print(f"映射关系已保存到 {mapping_file}")
    except Exception as e:
        print(f"保存映射关系时出错: {e}")

def get_gpu_id(gpu_name):
    """
    根据显卡名称获取GPU ID
    """
    url = f"https://www.3dmark.com/proxycon/ajax/search/gpuname?term={gpu_name}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # 根据实际返回格式调整
        if data and len(data) > 0:
            # 假设返回格式类似: [{"id": 1720, "label": "RTX 4090"}, ...]
            # return f'{data[0]["label"]}: {data[0]["id"]}'
            return data[0]

        return None
    except Exception as e:
        print(f"获取GPU ID失败 {gpu_name}: {e}")
        return None

def save_gpu_names(gpu_names_dict):
    """
    保存标准GPU名称到gpunames.json文件
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        names_file = os.path.join(current_dir, 'gpunames.json')
        
        with open(names_file, 'w', encoding='utf-8') as f:
            json.dump(gpu_names_dict, f, ensure_ascii=False, indent=2)
        
        print(f"GPU标准名称已保存到 {names_file}")
    except Exception as e:
        print(f"保存GPU标准名称时出错: {e}")

def build_gpu_mapping(gpu_names):
    """
    构建显卡名称到GPU ID的完整映射
    """
    # 先加载已有的映射关系
    gpu_mapping = get_gpu_mapping()
    # 用于存储原始名称到标准名称的映射
    gpu_names_dict = {}
    
    print(f"已存在 {len(gpu_mapping)} 个映射关系")
    
    # 处理新的显卡名称
    new_gpus = [name for name in gpu_names if name not in gpu_mapping]
    print(f"需要获取 {len(new_gpus)} 个新的GPU ID")
    
    for i, gpu_name in enumerate(new_gpus, 1):
        print(f"[{i}/{len(new_gpus)}] 获取 {gpu_name} 的GPU ID...")
        
        gpu_data = get_gpu_id(gpu_name)
        if gpu_data:
            gpu_mapping[gpu_data["label"]] = gpu_data["id"]
            # 保存原始名称到标准名称的映射
            gpu_names_dict[gpu_name] = gpu_data["label"]
            # 同时替换 gpu_names 列表中的原 gpu_name 为 gpu_id
            idx = gpu_names.index(gpu_name)
            gpu_names[idx] = gpu_data["id"]

            print(f"  成功: {gpu_name} -> {gpu_data['label']}: {gpu_data['id']}")
        else:
            gpu_mapping[gpu_name] = None
            gpu_names_dict[gpu_name] = None
            print(f"  失败: {gpu_name}")
        
        # 保存进度（每10个保存一次）
        if i % 10 == 0 or i == len(new_gpus):
            save_gpu_mapping(gpu_mapping)
            save_gpu_names(gpu_names_dict)
        
        # 添加延时避免请求过快
        time.sleep(1)
    
    # 最终保存
    save_gpu_mapping(gpu_mapping)
    save_gpu_names(gpu_names_dict)
    # return gpu_mapping



if __name__ == "__main__":
    # 从gpulist.json读取desktop显卡列表
    gpu_names = read_gpu_list()
    print(f"从 gpulist.json 读取到 {len(gpu_names)} 个显卡")
    
    # 构建映射关系
    gpu_mapping = build_gpu_mapping(gpu_names)

    print("处理完成！")
